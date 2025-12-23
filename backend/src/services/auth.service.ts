/**
 * @fileoverview Authentication service providing user authentication and token management
 * @author Offer Hub Team
 */

import { CreateUserDTO } from "@/types/user.types";
import { userService } from "./user.service";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
} from "@/utils/jwt.utils";
import { supabase } from "@/lib/supabase/supabase";
import { AuthUser, LoginDTO, RefreshTokenRecord, EmailLoginDTO, AuditLogEntry, DeviceInfo, UserRole, RegisterDTO, RegisterWithEmailDTO, RegisterWithWalletDTO } from "@/types/auth.types";
import { AppError, AuthenticationError, AuthorizationError } from "@/utils/AppError";
import { randomBytes } from "crypto";
import { sanitizeUser } from "@/utils/sanitizeUser";
import bcrypt from "bcryptjs";
// import { v4 as uuidv4 } from "uuid";
const uuidv4 = () => require('crypto').randomUUID();

export async function getNonce(wallet_address: string) {
  const nonce = randomBytes(16).toString("hex");

  const { data: existing, error: fetchErr } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", wallet_address)
    .single();

  if (fetchErr || !existing) throw new AppError("User not found", 404);

  const { error } = await supabase
    .from("users")
    .update({ nonce })
    .eq("wallet_address", wallet_address);

  if (error) throw new AppError("Failed to set nonce", 500);

  return nonce;
}

/**
 * Register new user with email and password
 * Creates an invisible wallet (Stellar keypair) for the user
 * @param data - Registration data with email and password
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function register(data: RegisterDTO, deviceInfo: DeviceInfo) {
  const { email, password } = data;

  // Import wallet service
  const walletService = await import('./wallet.service');
  const { validateEmail } = await import('@/utils/validation');

  // Validate email format
  if (!email || typeof email !== 'string') {
    throw new AppError('Email is required', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400);
  }

  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Generate a username from email (before @ symbol)
  const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 8);

  // Create user (without wallet_address initially)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        password_hash,
        username,
        name: username,
        is_freelancer: false,
        reputation_score: 0,
      },
    ])
    .select()
    .single();

  if (userError || !newUser) {
    throw new AppError(`Failed to create user: ${userError?.message || 'Unknown error'}`, 500);
  }

  try {
    // Generate invisible wallet (Stellar keypair) for the user
    const { wallet, publicKey } = await walletService.generateInvisibleWallet(newUser.id, email);

    // Update user with wallet address
    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_address: publicKey })
      .eq("id", newUser.id);

    if (updateError) {
      throw new AppError(`Failed to link wallet to user: ${updateError.message}`, 500);
    }

    // Log registration event
    await logAuthAttempt({
      userId: newUser.id,
      action: 'user_register',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken({ 
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: []
    });
    const { refreshToken, refreshTokenHash } = signRefreshToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: []
    });

    // Save refresh token in DB
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // Convert hex string to BYTEA for PostgreSQL
    const tokenHashBytes = Buffer.from(refreshTokenHash, 'hex');
    const { error: rtInsertError } = await supabase
      .from("refresh_tokens")
      .insert([{ 
        user_id: newUser.id, 
        token_hash: tokenHashBytes,
        expires_at: refreshTokenExpiry.toISOString()
      }]);

    if (rtInsertError) {
      throw new AppError("Failed to persist refresh token", 500);
    }

    const safeUser = sanitizeUser({ ...newUser, wallet_address: publicKey });

    return {
      user: safeUser,
      wallet: {
        address: publicKey,
        type: wallet.type,
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    // Rollback: delete user if wallet creation failed
    await supabase.from("users").delete().eq("id", newUser.id);
    throw error;
  }
}

export async function signup(data: CreateUserDTO) {
  const newUser = await userService.createUser(data);

  const accessToken = signAccessToken({ 
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role || UserRole.CLIENT,
    permissions: newUser.permissions?.map((p: { name: string }) => p.name) || []
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role || UserRole.CLIENT,
    permissions: newUser.permissions?.map((p: any) => p.name) || []
  });

  // Save refresh token in DB
  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([
      {
        user_id: newUser.id,
        token_hash: refreshTokenHash,
      },
    ]);

  if (rtInsertError) {
    throw new AppError("Failed to persist refresh token", 500);
  }

  const safeUser = sanitizeUser(newUser);

  return {
    user: safeUser,
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Register new user with email and password
 * Automatically generates an invisible Stellar wallet
 * @param data - Registration data with email, password, username
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function registerWithEmail(data: RegisterWithEmailDTO, deviceInfo: DeviceInfo) {
  const { email, password, username, name, bio, is_freelancer } = data;

  // Import wallet service
  const walletService = await import('./wallet.service');

  // Check if email already exists
  const { data: existingUser, error: emailCheckError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) {
    throw new AppError("Username already taken", 400);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user (without wallet_address initially)
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        password_hash,
        username,
        name: name || username,
        bio: bio || null,
        is_freelancer: is_freelancer || false,
        reputation_score: 0,
      },
    ])
    .select()
    .single();

  if (userError || !newUser) {
    throw new AppError(`Failed to create user: ${userError?.message || 'Unknown error'}`, 500);
  }

  try {
    // Generate invisible wallet for the user
    const { wallet, publicKey } = await walletService.generateInvisibleWallet(newUser.id);

    // Update user with wallet address
    const { error: updateError } = await supabase
      .from("users")
      .update({ wallet_address: publicKey })
      .eq("id", newUser.id);

    if (updateError) {
      throw new AppError(`Failed to link wallet to user: ${updateError.message}`, 500);
    }

    // Stellar blockchain registration disabled temporarily
    // TODO: Re-enable when Stellar integration is ready
    /*
    // Register user on Stellar blockchain
    const blockchainService = await import('./blockchain.service');
    const blockchainResult = await blockchainService.registerUserOnBlockchain(
      newUser.id,
      publicKey,
      1 // VerificationLevel.BASIC
    );

    // Update user with blockchain verification status
    if (blockchainResult.success) {
      await supabase
        .from("users")
        .update({
          verification_level: blockchainResult.verificationLevel,
          verified_on_blockchain: true,
          verified_at: new Date().toISOString(),
          verification_metadata: {
            transactionHash: blockchainResult.transactionHash,
            verifiedAt: new Date().toISOString(),
            method: 'email_registration',
          },
        })
        .eq("id", newUser.id);
    }
    */

    // Log registration event
    await logAuthAttempt({
      userId: newUser.id,
      action: 'user_register_email',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken({ 
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: []
    });
    const { refreshToken, refreshTokenHash } = signRefreshToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: []
    });

    // Save refresh token in DB
    const { error: rtInsertError } = await supabase
      .from("refresh_tokens")
      .insert([{ user_id: newUser.id, token_hash: refreshTokenHash }]);

    if (rtInsertError) {
      throw new AppError("Failed to persist refresh token", 500);
    }

    const safeUser = sanitizeUser({ ...newUser, wallet_address: publicKey });

    return {
      user: safeUser,
      wallet: {
        address: publicKey,
        type: 'invisible',
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    // Rollback: delete user if wallet creation failed
    await supabase.from("users").delete().eq("id", newUser.id);
    throw error;
  }
}

/**
 * Register new user with existing wallet
 * Links external wallet and creates account with email/password
 * @param data - Registration data with wallet address, signature, email, password
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function registerWithWallet(data: RegisterWithWalletDTO, deviceInfo: DeviceInfo) {
  const { wallet_address, signature, email, password, username, name, bio, is_freelancer } = data;

  // Import wallet service
  const walletService = await import('./wallet.service');

  // Verify signature (user must sign a message proving they own the wallet)
  // For Stellar, we would verify the signature using the wallet address
  // This is a placeholder - implement proper Stellar signature verification
  try {
    // TODO: Implement proper Stellar signature verification
    // For now, we'll proceed with the registration
  } catch (error) {
    throw new AppError("Invalid wallet signature", 401);
  }

  // Check if wallet already exists
  const { data: existingWallet } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", wallet_address)
    .single();

  if (existingWallet) {
    throw new AppError("Wallet already registered", 400);
  }

  // Check if email already exists
  const { data: existingEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  if (existingEmail) {
    throw new AppError("Email already registered", 400);
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) {
    throw new AppError("Username already taken", 400);
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user with wallet address
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert([
      {
        wallet_address,
        email: email.toLowerCase(),
        password_hash,
        username,
        name: name || username,
        bio: bio || null,
        is_freelancer: is_freelancer || false,
        reputation_score: 0,
      },
    ])
    .select()
    .single();

  if (userError || !newUser) {
    throw new AppError(`Failed to create user: ${userError?.message || 'Unknown error'}`, 500);
  }

  try {
    // Link external wallet to user
    await walletService.linkExternalWallet(newUser.id, wallet_address);

    // Stellar blockchain registration disabled temporarily
    // TODO: Re-enable when Stellar integration is ready
    /*
    // Register user on Stellar blockchain
    const blockchainService = await import('./blockchain.service');
    const blockchainResult = await blockchainService.registerUserOnBlockchain(
      newUser.id,
      wallet_address,
      1 // VerificationLevel.BASIC
    );

    // Update user with blockchain verification status
    if (blockchainResult.success) {
      await supabase
        .from("users")
        .update({
          verification_level: blockchainResult.verificationLevel,
          verified_on_blockchain: true,
          verified_at: new Date().toISOString(),
          verification_metadata: {
            transactionHash: blockchainResult.transactionHash,
            verifiedAt: new Date().toISOString(),
            method: 'wallet_connection',
          },
        })
        .eq("id", newUser.id);
    }
    */

    // Log registration event
    await logAuthAttempt({
      userId: newUser.id,
      action: 'user_register_wallet',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });

    // Generate tokens
    const accessToken = signAccessToken({ 
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: []
    });
    const { refreshToken, refreshTokenHash } = signRefreshToken({
      sub: newUser.id,
      email: newUser.email,
      role: UserRole.CLIENT,
      permissions: []
    });

    // Save refresh token in DB
    const { error: rtInsertError } = await supabase
      .from("refresh_tokens")
      .insert([{ user_id: newUser.id, token_hash: refreshTokenHash }]);

    if (rtInsertError) {
      throw new AppError("Failed to persist refresh token", 500);
    }

    const safeUser = sanitizeUser(newUser);

    return {
      user: safeUser,
      wallet: {
        address: wallet_address,
        type: 'external',
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (error) {
    // Rollback: delete user if wallet linking failed
    await supabase.from("users").delete().eq("id", newUser.id);
    throw error;
  }
}

export async function login(data: LoginDTO) {
  const { wallet_address, signature } = data;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", wallet_address)
    .single();

  if (error || !user) throw new AppError("User not found", 401);

  // Stellar signature verification disabled temporarily
  // TODO: Re-enable when Stellar integration is ready
  /*
  // Verify signature
  let recoveredAddress: string;
  try {
    recoveredAddress = utils.verifyMessage(user.nonce || '', signature || '');
  } catch {
    throw new AppError("Invalid signature", 401);
  }

  if (recoveredAddress.toLowerCase() !== (wallet_address || '').toLowerCase()) {
    throw new AppError("Signature does not match wallet address", 401);
  }
  */

  // Clear nonce after successful login
  await supabase
    .from("users")
    .update({ nonce: null })
    .eq("wallet_address", wallet_address);

  // Issue tokens
  const accessToken = signAccessToken({ 
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });

  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([{ user_id: user.id, token_hash: refreshTokenHash }]);

  if (rtInsertError) {
    throw new AppError("Failed to persist refresh token", 500);
  }

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshSession(tokenRecord: RefreshTokenRecord) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", tokenRecord.user_id)
    .single();

  if (error || !user) {
    throw new AppError("User not found", 404);
  }

  const accessToken = signAccessToken({ 
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });
  const { refreshToken: newRefreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });

  const { data: rotateData, error: rotateError } = await supabase
    .from("refresh_tokens")
    .update({
      token_hash: refreshTokenHash,
      created_at: new Date().toISOString(),
    })
    .eq("token_hash", tokenRecord.token_hash)
    .eq("user_id", tokenRecord.user_id)
    .eq("created_at", tokenRecord.created_at)
    .select("id");

  if (rotateError || !rotateData || rotateData.length !== 1) {
    throw new AppError("Failed to rotate refresh token", 500);
  }

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(refreshToken: string) {
  const refreshTokenHash = hashToken(refreshToken);
  const { error } = await supabase
    .from("refresh_tokens")
    .delete()
    .eq("token_hash", refreshTokenHash);

  if (error) throw new AppError(error.message, 500);

  return { message: "Logged out successfully" };
}

export async function getMe(userId: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) throw new AppError("User not found", 404);

  const safeUser = sanitizeUser(user);

  return safeUser as unknown as AuthUser;
}

/**
 * Authenticate user with email and password
 * @param data - Email login credentials
 * @param deviceInfo - Device information for audit logging
 * @returns User data and JWT tokens
 */
export async function loginWithEmail(data: EmailLoginDTO, deviceInfo: DeviceInfo) {
  const { email, password } = data;

  // Log login attempt
  await logAuthAttempt({
    userId: '', // Will be set after user lookup
    action: 'login_attempt',
    resource: 'auth',
    ipAddress: deviceInfo.ip_address || '',
    userAgent: deviceInfo.user_agent || '',
    timestamp: new Date(),
  });

  // Find user by email
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !user) {
    await logAuthAttempt({
      userId: '',
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if user has a password (email auth enabled)
  if (!user.password_hash) {
    await logAuthAttempt({
      userId: user.id,
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AuthenticationError("Email authentication not enabled for this account. Please use wallet authentication.");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    await logAuthAttempt({
      userId: user.id,
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AuthenticationError("Invalid email or password");
  }

  // Check if user is active
  if (!user.is_active) {
    await logAuthAttempt({
      userId: user.id,
      action: 'login_failure',
      resource: 'auth',
      ipAddress: deviceInfo.ip_address || '',
      userAgent: deviceInfo.user_agent || '',
      timestamp: new Date(),
    });
    throw new AuthorizationError("Account is inactive. Please contact support.");
  }

  // Update last_login_at
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  // Generate tokens
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });
  const { refreshToken, refreshTokenHash } = signRefreshToken({
    sub: user.id,
    email: user.email || '',
    role: user.role || UserRole.CLIENT,
    permissions: user.permissions?.map((p: any) => p.name) || []
  });

  // Calculate refresh token expiration time
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save refresh token (using schema from migration)
  const tokenHashBytes = Buffer.from(refreshTokenHash, 'hex');
  const { error: rtInsertError } = await supabase
    .from("refresh_tokens")
    .insert([{
      user_id: user.id,
      token_hash: tokenHashBytes,
      expires_at: refreshTokenExpiry.toISOString(),
      is_revoked: false,
    }]);

  if (rtInsertError) {
    console.error("Failed to persist refresh token:", rtInsertError);
    throw new AppError("Failed to create session", 500);
  }

  // Log successful login
  await logAuthAttempt({
    userId: user.id,
    action: 'login_success',
    resource: 'auth',
    ipAddress: deviceInfo.ip_address || '',
    userAgent: deviceInfo.user_agent || '',
    timestamp: new Date(),
  });

  const safeUser = sanitizeUser(user);

  return {
    user: safeUser,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
      tokenType: "Bearer",
    },
  };
}

/**
 * Log authentication attempts for audit purposes
 * @param logEntry - Audit log entry
 */
async function logAuthAttempt(logEntry: Omit<AuditLogEntry, 'id'>): Promise<void> {
  try {
    const auditEntry: AuditLogEntry = {
      id: uuidv4(),
      ...logEntry,
    };

    // In production, this should be stored in a dedicated audit table
    // For now, we'll log to console with structured format
    console.log(JSON.stringify({
      type: 'AUTH_AUDIT',
      ...auditEntry,
    }));

    // TODO: Store in audit_logs table
    // await supabase.from('audit_logs').insert(auditEntry);
  } catch (error) {
    console.error('Failed to log auth attempt:', error);
  }
}

/**
 * Get active sessions for a user
 * @param userId - User ID
 * @returns List of active sessions
 */
export async function getUserSessions(userId: string) {
  const { data: sessions, error } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError("Failed to retrieve sessions", 500);
  }

  return {
    sessions: sessions || [],
    total: sessions?.length || 0,
  };
}

/**
 * Deactivate a user session
 * @param userId - User ID
 * @param sessionId - Session ID to deactivate
 */
export async function deactivateSession(userId: string, sessionId: string) {
  const { error } = await supabase
    .from("user_sessions")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("id", sessionId);

  if (error) {
    throw new AppError("Failed to deactivate session", 500);
  }
}
