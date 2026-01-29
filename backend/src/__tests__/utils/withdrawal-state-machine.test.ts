/**
 * @fileoverview Unit tests for Withdrawal State Machine
 */

import { WithdrawalStateMachine } from '@/utils/withdrawal-state-machine';
import { WithdrawalStatus } from '@/types/withdrawal.types';

describe('WithdrawalStateMachine', () => {
  describe('canTransition', () => {
    it('should allow transition from CREATED to PENDING_VERIFICATION', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.CREATED,
          WithdrawalStatus.PENDING_VERIFICATION
        )
      ).toBe(true);
    });

    it('should allow transition from CREATED to WITHDRAWAL_CANCELED', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.CREATED,
          WithdrawalStatus.WITHDRAWAL_CANCELED
        )
      ).toBe(true);
    });

    it('should allow transition from PENDING_VERIFICATION to WITHDRAWAL_CANCELED', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.PENDING_VERIFICATION,
          WithdrawalStatus.WITHDRAWAL_CANCELED
        )
      ).toBe(true);
    });

    it('should allow transition from WITHDRAWAL_FAILED to WITHDRAWAL_REFUNDED', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.WITHDRAWAL_FAILED,
          WithdrawalStatus.WITHDRAWAL_REFUNDED
        )
      ).toBe(true);
    });

    it('should NOT allow transition from WITHDRAWAL_COMPLETED to any state', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.WITHDRAWAL_COMPLETED,
          WithdrawalStatus.WITHDRAWAL_CANCELED
        )
      ).toBe(false);
    });

    it('should NOT allow transition from WITHDRAWAL_CANCELED to any state', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.WITHDRAWAL_CANCELED,
          WithdrawalStatus.WITHDRAWAL_REFUNDED
        )
      ).toBe(false);
    });

    it('should NOT allow transition from WITHDRAWAL_REFUNDED to any state', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.WITHDRAWAL_REFUNDED,
          WithdrawalStatus.CREATED
        )
      ).toBe(false);
    });

    it('should NOT allow transition from WITHDRAWAL_FAILED to WITHDRAWAL_CANCELED', () => {
      expect(
        WithdrawalStateMachine.canTransition(
          WithdrawalStatus.WITHDRAWAL_FAILED,
          WithdrawalStatus.WITHDRAWAL_CANCELED
        )
      ).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('should return correct valid transitions for CREATED status', () => {
      const validTransitions = WithdrawalStateMachine.getValidTransitions(
        WithdrawalStatus.CREATED
      );
      expect(validTransitions).toEqual([
        WithdrawalStatus.PENDING_VERIFICATION,
        WithdrawalStatus.WITHDRAWAL_CANCELED,
        WithdrawalStatus.WITHDRAWAL_FAILED,
      ]);
    });

    it('should return correct valid transitions for PENDING_VERIFICATION status', () => {
      const validTransitions = WithdrawalStateMachine.getValidTransitions(
        WithdrawalStatus.PENDING_VERIFICATION
      );
      expect(validTransitions).toEqual([
        WithdrawalStatus.WITHDRAWAL_COMPLETED,
        WithdrawalStatus.WITHDRAWAL_CANCELED,
        WithdrawalStatus.WITHDRAWAL_FAILED,
      ]);
    });

    it('should return only WITHDRAWAL_REFUNDED for WITHDRAWAL_FAILED status', () => {
      const validTransitions = WithdrawalStateMachine.getValidTransitions(
        WithdrawalStatus.WITHDRAWAL_FAILED
      );
      expect(validTransitions).toEqual([WithdrawalStatus.WITHDRAWAL_REFUNDED]);
    });

    it('should return empty array for WITHDRAWAL_COMPLETED status', () => {
      const validTransitions = WithdrawalStateMachine.getValidTransitions(
        WithdrawalStatus.WITHDRAWAL_COMPLETED
      );
      expect(validTransitions).toEqual([]);
    });

    it('should return empty array for WITHDRAWAL_CANCELED status', () => {
      const validTransitions = WithdrawalStateMachine.getValidTransitions(
        WithdrawalStatus.WITHDRAWAL_CANCELED
      );
      expect(validTransitions).toEqual([]);
    });

    it('should return empty array for WITHDRAWAL_REFUNDED status', () => {
      const validTransitions = WithdrawalStateMachine.getValidTransitions(
        WithdrawalStatus.WITHDRAWAL_REFUNDED
      );
      expect(validTransitions).toEqual([]);
    });
  });

  describe('canCancel', () => {
    it('should return true for CREATED status', () => {
      expect(WithdrawalStateMachine.canCancel(WithdrawalStatus.CREATED)).toBe(true);
    });

    it('should return true for PENDING_VERIFICATION status', () => {
      expect(
        WithdrawalStateMachine.canCancel(WithdrawalStatus.PENDING_VERIFICATION)
      ).toBe(true);
    });

    it('should return false for WITHDRAWAL_FAILED status', () => {
      expect(
        WithdrawalStateMachine.canCancel(WithdrawalStatus.WITHDRAWAL_FAILED)
      ).toBe(false);
    });

    it('should return false for WITHDRAWAL_COMPLETED status', () => {
      expect(
        WithdrawalStateMachine.canCancel(WithdrawalStatus.WITHDRAWAL_COMPLETED)
      ).toBe(false);
    });

    it('should return false for WITHDRAWAL_CANCELED status', () => {
      expect(
        WithdrawalStateMachine.canCancel(WithdrawalStatus.WITHDRAWAL_CANCELED)
      ).toBe(false);
    });

    it('should return false for WITHDRAWAL_REFUNDED status', () => {
      expect(
        WithdrawalStateMachine.canCancel(WithdrawalStatus.WITHDRAWAL_REFUNDED)
      ).toBe(false);
    });
  });

  describe('canRefund', () => {
    it('should return true for WITHDRAWAL_FAILED status', () => {
      expect(
        WithdrawalStateMachine.canRefund(WithdrawalStatus.WITHDRAWAL_FAILED)
      ).toBe(true);
    });

    it('should return false for CREATED status', () => {
      expect(WithdrawalStateMachine.canRefund(WithdrawalStatus.CREATED)).toBe(false);
    });

    it('should return false for PENDING_VERIFICATION status', () => {
      expect(
        WithdrawalStateMachine.canRefund(WithdrawalStatus.PENDING_VERIFICATION)
      ).toBe(false);
    });

    it('should return false for WITHDRAWAL_COMPLETED status', () => {
      expect(
        WithdrawalStateMachine.canRefund(WithdrawalStatus.WITHDRAWAL_COMPLETED)
      ).toBe(false);
    });

    it('should return false for WITHDRAWAL_CANCELED status', () => {
      expect(
        WithdrawalStateMachine.canRefund(WithdrawalStatus.WITHDRAWAL_CANCELED)
      ).toBe(false);
    });

    it('should return false for WITHDRAWAL_REFUNDED status', () => {
      expect(
        WithdrawalStateMachine.canRefund(WithdrawalStatus.WITHDRAWAL_REFUNDED)
      ).toBe(false);
    });
  });
});
