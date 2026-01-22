/**
 * @fileoverview Email service for sending transactional emails
 * @author Offer Hub Team
 * 
 * IMPORTANT: The recipient email (user's email) comes from the request/database,
 * NOT from environment variables. Environment variables only configure the
 * SMTP server credentials used to SEND emails.
 */

import { AppError } from '@/utils/AppError';

// Dynamic import for nodemailer (handles case where it's not installed)
let nodemailer: any;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  console.warn('⚠️  nodemailer not installed. Email functionality will be disabled.');
  console.warn('   Install it with: npm install nodemailer @types/nodemailer');
}

// Email configuration interface
interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  service?: string;
}

// Email message interface
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Create email transporter based on environment variables
 * Supports multiple email providers (SMTP, Gmail, SendGrid, etc.)
 * 
 * NOTE: EMAIL_USER and EMAIL_PASSWORD are the SMTP server credentials,
 * NOT the recipient email. The recipient email comes from the user's request.
 */
function createTransporter() {
  if (!nodemailer) {
    throw new AppError(
      'Email service is not configured. Please install nodemailer: npm install nodemailer @types/nodemailer',
      500,
      'EMAIL_SERVICE_NOT_CONFIGURED'
    );
  }

  // Check if using a service provider (Gmail, SendGrid, etc.)
  // These are SMTP server credentials, not recipient emails
  const service = process.env.EMAIL_SERVICE;
  const smtpUser = process.env.EMAIL_USER; // SMTP server username
  const smtpPassword = process.env.EMAIL_PASSWORD; // SMTP server password

  if (service && smtpUser && smtpPassword) {
    // Use service provider (Gmail, SendGrid, etc.)
    return nodemailer.createTransport({
      service,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  }

  // Use SMTP configuration
  const smtpConfig: EmailConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: smtpUser && smtpPassword ? { user: smtpUser, pass: smtpPassword } : undefined,
  };

  return nodemailer.createTransport(smtpConfig);
}

/**
 * Send an email
 * @param message - Email message to send
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  try {
    // In development, log email instead of sending if EMAIL_DISABLED is set
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_DISABLED === 'true') {
      console.log('📧 Email (disabled in dev):', {
        to: message.to,
        subject: message.subject,
        html: message.html,
      });
      return;
    }

    const transporter = createTransporter();
    // EMAIL_FROM is the sender email address (appears as "From" in emails)
    // This is different from EMAIL_USER which is the SMTP server username
    const from = process.env.EMAIL_FROM || 'noreply@offer-hub.org';

    await transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text || message.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log(`✅ Email sent successfully to ${message.to}`);
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    throw new AppError(
      `Failed to send email: ${error.message || 'Unknown error'}`,
      500,
      'EMAIL_SEND_FAILED'
    );
  }
}

/**
 * Send password reset email
 * @param email - Recipient email address
 * @param resetToken - Password reset token
 * @param resetUrl - URL to reset password page (optional, will use default if not provided)
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl?: string
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = resetUrl || `${frontendUrl}/onboarding/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: #2c3e50; margin-top: 0;">Reset Your Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password for your Offer Hub account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetLink}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>This link will expire in 1 hour.</strong>
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; margin-bottom: 0;">
          This is an automated message from Offer Hub. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Offer Hub Password',
    html,
  });
}

