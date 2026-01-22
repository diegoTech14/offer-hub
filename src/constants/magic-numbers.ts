/**
 * Application constants to replace magic numbers throughout the codebase
 * These constants improve code readability and maintainability
 */

// Timeout and delay constants (in milliseconds)
export const TIMEOUTS = {
  // API simulation delays
  API_DELAY_SHORT: 300,
  API_DELAY_MEDIUM: 500,
  API_DELAY_LONG: 800,
  API_DELAY_VERY_LONG: 1000,
  API_DELAY_EXTRA_LONG: 1500,
  API_DELAY_MAX: 2000,
  
  // UI interaction timeouts
  COPY_FEEDBACK_DURATION: 2000,
  TYPING_INDICATOR_DURATION: 1000,
  MESSAGE_STATUS_DELIVERED_DELAY: 600,
  MESSAGE_STATUS_READ_DELAY: 1400,
  TYPING_SIMULATION_INTERVAL: 6500,
  PEER_TYPING_TIMEOUT: 1200,
  JUMP_BACK_DISPLAY_DURATION: 600,
  LOADING_STATE_DURATION: 1000,
} as const;

// Validation and form limits
export const VALIDATION_LIMITS = {
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  
  // Bio requirements
  MIN_BIO_LENGTH: 100,
  
  // Skills and job types
  MAX_SKILLS_PER_USER: 15,
  MAX_SKILLS_PER_PROJECT: 10,
  MAX_JOB_TYPES_SELECTION: 4,
  
  // Text input limits
  MIN_MESSAGE_LENGTH: 5,
  MAX_REVIEW_COMMENT_LENGTH: 500,
  
  // Display truncation
  MAX_EMAIL_DISPLAY_LENGTH: 25,
  MAX_DISPUTE_PARTY_NAME_LENGTH: 45,
  MAX_WALLET_ADDRESS_PREFIX: 6,
  MAX_WALLET_ADDRESS_SUFFIX: 4,
  MAX_AVATAR_INITIALS: 2,
  MAX_TECHNOLOGIES_DISPLAY: 3,
  MAX_SKILLS_DISPLAY_CARD: 5,
  MAX_SKILLS_DISPLAY_DETAIL: 3,
  MAX_PORTFOLIO_ITEMS_DISPLAY: 2,
  MAX_ERRORS_DISPLAY: 10,
} as const;

// UI and display constants
export const UI_CONSTANTS = {
  // Avatar and image sizes
  AVATAR_SIZE_SMALL: 28,
  AVATAR_SIZE_MEDIUM: 40,
  ASSET_IMAGE_SIZE: 900,
  DEPOSIT_ICON_WIDTH: 18,
  DEPOSIT_ICON_HEIGHT: 14,
  
  // Pagination and limits
  MAX_ITEMS_PER_PAGE: 10,
  MAX_SELECTED_FREELANCERS_MIN: 2,
  MAX_SELECTED_FREELANCERS_MAX: 3,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Data generation constants
export const DATA_GENERATION = {
  // Random number ranges
  USERNAME_SUFFIX_MAX: 1000,
  WALLET_ADDRESS_LENGTH: 15,
  CONTRACT_AMOUNT_MIN: 100,
  CONTRACT_AMOUNT_MAX: 5000,
  PROJECT_ID_RANGE_MIN: 10000,
  PROJECT_ID_RANGE_MAX: 90000,
  
  // Time calculations
  SIX_MONTHS_IN_MS: 6 * 30 * 24 * 60 * 60 * 1000,
  
  // Probability thresholds
  REVIEW_COMMENT_PROBABILITY: 0.95, // 95% chance of having a comment
  ACCOUNT_EXISTS_PROBABILITY: 0.5, // 50% chance
} as const;

// Seeding configuration
export const SEEDING_CONFIG = {
  DEFAULT_USERS_COUNT: 50,
  SMALL_SEED_COUNT: 10,
  MEDIUM_SEED_COUNT: 20,
  LARGE_SEED_COUNT: 30,
  MAX_SEED_COUNT: 100,
  FREELANCERS_PERCENTAGE: 0.4, // 40% freelancers, 60% clients
  CONTRACTS_PER_FREELANCER_MIN: 5,
  CONTRACTS_PER_FREELANCER_MAX: 20,
  REVIEW_PROBABILITY: 0.8, // 80% of contracts have reviews
} as const;
