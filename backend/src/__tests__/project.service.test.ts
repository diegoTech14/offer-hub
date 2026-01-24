// Mock supabase before importing project.service
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

// Mock escrow service to avoid stellar-sdk dependency
jest.mock('@/services/escrow.service', () => ({
  escrowService: {
    createEscrow: jest.fn(),
  },
}));

// Mock user service
jest.mock('@/services/user.service', () => ({
  userService: {
    getUserById: jest.fn(),
  },
}));

import { isValidStatusTransition } from '@/services/project.service';

describe('Project Service - Status Transition Validation', () => {
  describe('isValidStatusTransition', () => {
    describe('from "open" status', () => {
      it('should allow transition to "in_progress"', () => {
        expect(isValidStatusTransition('open', 'in_progress')).toBe(true);
      });

      it('should allow transition to "cancelled"', () => {
        expect(isValidStatusTransition('open', 'cancelled')).toBe(true);
      });

      it('should NOT allow direct transition to "completed"', () => {
        expect(isValidStatusTransition('open', 'completed')).toBe(false);
      });

      it('should allow staying in "open" status', () => {
        expect(isValidStatusTransition('open', 'open')).toBe(true);
      });
    });

    describe('from "in_progress" status', () => {
      it('should allow transition to "completed"', () => {
        expect(isValidStatusTransition('in_progress', 'completed')).toBe(true);
      });

      it('should allow transition to "cancelled"', () => {
        expect(isValidStatusTransition('in_progress', 'cancelled')).toBe(true);
      });

      it('should NOT allow transition back to "open"', () => {
        expect(isValidStatusTransition('in_progress', 'open')).toBe(false);
      });

      it('should allow staying in "in_progress" status', () => {
        expect(isValidStatusTransition('in_progress', 'in_progress')).toBe(true);
      });
    });

    describe('from "completed" status', () => {
      it('should NOT allow any transitions', () => {
        expect(isValidStatusTransition('completed', 'open')).toBe(false);
        expect(isValidStatusTransition('completed', 'in_progress')).toBe(false);
        expect(isValidStatusTransition('completed', 'cancelled')).toBe(false);
      });

      it('should allow staying in "completed" status', () => {
        expect(isValidStatusTransition('completed', 'completed')).toBe(true);
      });
    });

    describe('from "cancelled" status', () => {
      it('should NOT allow any transitions', () => {
        expect(isValidStatusTransition('cancelled', 'open')).toBe(false);
        expect(isValidStatusTransition('cancelled', 'in_progress')).toBe(false);
        expect(isValidStatusTransition('cancelled', 'completed')).toBe(false);
      });

      it('should allow staying in "cancelled" status', () => {
        expect(isValidStatusTransition('cancelled', 'cancelled')).toBe(true);
      });
    });

    describe('from "pending" status (backward compatibility)', () => {
      it('should allow transition to "in_progress"', () => {
        expect(isValidStatusTransition('pending', 'in_progress')).toBe(true);
      });

      it('should allow transition to "cancelled"', () => {
        expect(isValidStatusTransition('pending', 'cancelled')).toBe(true);
      });

      it('should NOT allow direct transition to "completed"', () => {
        expect(isValidStatusTransition('pending', 'completed')).toBe(false);
      });

      it('should allow staying in "pending" status', () => {
        expect(isValidStatusTransition('pending', 'pending')).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle unknown current status', () => {
        expect(isValidStatusTransition('unknown', 'open')).toBe(false);
        expect(isValidStatusTransition('unknown', 'in_progress')).toBe(false);
      });

      it('should allow same status (no change)', () => {
        expect(isValidStatusTransition('open', 'open')).toBe(true);
        expect(isValidStatusTransition('pending', 'pending')).toBe(true);
        expect(isValidStatusTransition('in_progress', 'in_progress')).toBe(true);
        expect(isValidStatusTransition('completed', 'completed')).toBe(true);
        expect(isValidStatusTransition('cancelled', 'cancelled')).toBe(true);
      });
    });
  });
});
