/**
 * @fileoverview Utility functions to mask sensitive data like wallet addresses and emails
 * @author Offer Hub Team
 */

/**
 * Masks a wallet address showing only first 6 and last 4 characters
 * @param wallet - The wallet address to mask
 * @returns Masked wallet address (e.g., "0x1234...abcd")
 */
export function maskWalletAddress(wallet: string): string {
  if (!wallet || wallet.length < 10) {
    return wallet;
  }
  
  const start = wallet.slice(0, 6);
  const end = wallet.slice(-4);
  
  return `${start}...${end}`;
}

/**
 * Masks an email address showing only first 3 characters of username and full domain
 * @param email - The email address to mask
 * @returns Masked email (e.g., "joh***@example.com")
 */
export function maskEmail(email?: string): string {
  if (!email) {
    return "N/A";
  }
  
  const [username, domain] = email.split("@");
  
  if (!username || !domain) {
    return "N/A";
  }
  
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`;
  }
  
  const visiblePart = username.slice(0, 3);
  
  return `${visiblePart}***@${domain}`;
}

