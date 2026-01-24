/**
 * Types for user registration flows
 */

export interface RegisterWithEmailPayload {
  email: string;
  password: string;
  username: string;
  name?: string;
  bio?: string;
  is_freelancer?: boolean;
}

export interface RegisterWithWalletPayload {
  wallet_address: string;
  signature: string;
  email: string;
  password: string;
  username: string;
  name?: string;
  bio?: string;
  is_freelancer?: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: UserData;
    wallet: WalletData;
    tokens: TokenData;
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  is_freelancer: boolean;
  wallet_address?: string;
  reputation_score: number;
  created_at: string;
}

export interface WalletData {
  address: string;
  type: 'invisible' | 'external';
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface LoginWithEmailPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserData;
    tokens: TokenData;
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}

// Form states
export interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  name?: string;
  bio?: string;
  is_freelancer: boolean;
}

export interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  name?: string;
  bio?: string;
  general?: string;
}

export interface WalletRegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  name?: string;
  bio?: string;
  is_freelancer: boolean;
  wallet_address?: string;
  signature?: string;
}


