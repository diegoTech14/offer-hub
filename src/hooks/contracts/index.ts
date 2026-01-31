// Main OfferHub contract hooks
export { useOfferHub } from './useOfferHub';

// Individual contract hooks
export { useUserRegistry } from './useUserRegistry';
export { useEscrow } from './useEscrow';
export { usePublication } from './usePublication';
export { useRating } from './useRating';
export { useDispute } from './useDispute';

// Types
export type {
  ContractAddresses,
  UseOfferHubReturn,
  ContractStatus,
} from './useOfferHub';

export type {
  UserProfile,
  UserProfileSummary,
  UserStatus,
  VerificationLevel,
  UserDataExport,
  AllUsersExport,
  PlatformDataExport,
} from './useUserRegistry';

export type {
  EscrowData,
  EscrowSummary,
  Milestone,
  MilestoneHistory,
  ContractConfig,
  EscrowStatus,
  MilestoneStatus,
} from './useEscrow';

export type {
  PublicationData,
  PublicationStatus,
  PublicationType,
  PublicationFilters,
  PublicationStats,
  CategoryStats,
} from './usePublication';

export type {
  RatingData,
  RatingSummary,
  UserRatingStats,
  RatingStatus,
  RatingFilters,
  ModerationAction,
  PlatformRatingStats,
  CategoryRatingStats,
  RatingTrend,
  RewardInfo,
  RatingConfig,
} from './useRating';

export type {
  DisputeData,
  Evidence,
  DisputeStatus,
  DisputeResolution,
  DisputeFilters,
  DisputeStats,
  MediatorStats,
  DisputeConfig,
} from './useDispute';
