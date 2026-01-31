// Soroban type definitions for TypeScript
// These types correspond to the Soroban SDK types

export type Address = string;
export type u32 = number;
export type u64 = number;
export type i128 = string; // Large integers are represented as strings in JavaScript
export type f64 = number;
export type Symbol = string;
export type String = string;
export type Vec<T> = T[];
export type Map<K, V> = Record<string, V>;
export type Option<T> = T | null;

// Re-export commonly used types
export type {
  Address,
  u32,
  u64,
  i128,
  f64,
  Symbol,
  String,
  Vec,
  Map,
  Option,
};
