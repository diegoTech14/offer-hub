/**
 * State Diagram:
 * [*] --> WITHDRAWAL_CREATED
 * WITHDRAWAL_CREATED --> WITHDRAWAL_PENDING_VERIFICATION
 * WITHDRAWAL_CREATED --> WITHDRAWAL_CANCELED
 * WITHDRAWAL_PENDING_VERIFICATION --> WITHDRAWAL_PROCESSING
 * WITHDRAWAL_PENDING_VERIFICATION --> WITHDRAWAL_REJECTED
 * WITHDRAWAL_PENDING_VERIFICATION --> WITHDRAWAL_CANCELED
 * WITHDRAWAL_PROCESSING --> WITHDRAWAL_COMMITTED
 * WITHDRAWAL_COMMITTED --> WITHDRAWAL_SUCCEEDED
 * WITHDRAWAL_COMMITTED --> WITHDRAWAL_FAILED
 * WITHDRAWAL_FAILED --> WITHDRAWAL_REFUNDED
 */
export enum WithdrawalState {
  WITHDRAWAL_CREATED = "WITHDRAWAL_CREATED",
  WITHDRAWAL_PENDING_VERIFICATION = "WITHDRAWAL_PENDING_VERIFICATION",
  WITHDRAWAL_PROCESSING = "WITHDRAWAL_PROCESSING",
  WITHDRAWAL_REJECTED = "WITHDRAWAL_REJECTED",
  WITHDRAWAL_CANCELED = "WITHDRAWAL_CANCELED",
  WITHDRAWAL_COMMITTED = "WITHDRAWAL_COMMITTED",
  WITHDRAWAL_SUCCEEDED = "WITHDRAWAL_SUCCEEDED",
  WITHDRAWAL_FAILED = "WITHDRAWAL_FAILED",
  WITHDRAWAL_REFUNDED = "WITHDRAWAL_REFUNDED",
}

export interface Withdrawal {
  id: string;
  status: WithdrawalState;
  [key: string]: unknown;
}

const VALID_TRANSITIONS: Record<WithdrawalState, WithdrawalState[]> = {
  [WithdrawalState.WITHDRAWAL_CREATED]: [
    WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
    WithdrawalState.WITHDRAWAL_CANCELED,
  ],
  [WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION]: [
    WithdrawalState.WITHDRAWAL_PROCESSING,
    WithdrawalState.WITHDRAWAL_REJECTED,
    WithdrawalState.WITHDRAWAL_CANCELED,
  ],
  [WithdrawalState.WITHDRAWAL_PROCESSING]: [
    WithdrawalState.WITHDRAWAL_COMMITTED,
  ],
  [WithdrawalState.WITHDRAWAL_COMMITTED]: [
    WithdrawalState.WITHDRAWAL_SUCCEEDED,
    WithdrawalState.WITHDRAWAL_FAILED,
  ],
  [WithdrawalState.WITHDRAWAL_FAILED]: [WithdrawalState.WITHDRAWAL_REFUNDED],
  [WithdrawalState.WITHDRAWAL_REJECTED]: [],
  [WithdrawalState.WITHDRAWAL_CANCELED]: [],
  [WithdrawalState.WITHDRAWAL_SUCCEEDED]: [],
  [WithdrawalState.WITHDRAWAL_REFUNDED]: [],
};

export class InvalidStateTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid state transition from '${from}' to '${to}'`);
    this.name = "InvalidStateTransitionError";
  }
}

export class WithdrawalStateMachine {
  canTransition(from: WithdrawalState, to: WithdrawalState): boolean {
    const allowedTransitions = VALID_TRANSITIONS[from];
    if (!allowedTransitions) {
      return false;
    }
    return allowedTransitions.includes(to);
  }

  getAllowedTransitions(from: WithdrawalState): WithdrawalState[] {
    return VALID_TRANSITIONS[from] || [];
  }

  transition<T extends Withdrawal>(withdrawal: T, toState: WithdrawalState): T {
    const fromState = withdrawal.status;

    if (!this.canTransition(fromState, toState)) {
      throw new InvalidStateTransitionError(fromState, toState);
    }

    return {
      ...withdrawal,
      status: toState,
    };
  }

  isTerminalState(state: WithdrawalState): boolean {
    const allowedTransitions = VALID_TRANSITIONS[state];
    return !allowedTransitions || allowedTransitions.length === 0;
  }

  isInitialState(state: WithdrawalState): boolean {
    return state === WithdrawalState.WITHDRAWAL_CREATED;
  }

  getAllStates(): WithdrawalState[] {
    return Object.values(WithdrawalState);
  }

  getTerminalStates(): WithdrawalState[] {
    return this.getAllStates().filter((state) => this.isTerminalState(state));
  }
}
