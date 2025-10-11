import { User } from "@/types/user.types";

export function sanitizeUser(user: User) {
  // Only remove sensitive fields (nonce), keep verification fields
  const { nonce, ...safeUser } = user;
  return safeUser;
}
