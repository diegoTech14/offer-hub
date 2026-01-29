import {
  WithdrawalStateMachine,
  WithdrawalState,
  Withdrawal,
  InvalidStateTransitionError,
} from "../state-machines";

describe("WithdrawalStateMachine", () => {
  let stateMachine: WithdrawalStateMachine;

  beforeEach(() => {
    stateMachine = new WithdrawalStateMachine();
  });

  describe("canTransition", () => {
    describe("valid transitions from WITHDRAWAL_CREATED", () => {
      it("should allow transition to WITHDRAWAL_PENDING_VERIFICATION", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_CREATED,
            WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
          ),
        ).toBe(true);
      });

      it("should allow transition to WITHDRAWAL_CANCELED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_CREATED,
            WithdrawalState.WITHDRAWAL_CANCELED,
          ),
        ).toBe(true);
      });
    });

    describe("valid transitions from WITHDRAWAL_PENDING_VERIFICATION", () => {
      it("should allow transition to WITHDRAWAL_PROCESSING", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
            WithdrawalState.WITHDRAWAL_PROCESSING,
          ),
        ).toBe(true);
      });

      it("should allow transition to WITHDRAWAL_REJECTED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
            WithdrawalState.WITHDRAWAL_REJECTED,
          ),
        ).toBe(true);
      });

      it("should allow transition to WITHDRAWAL_CANCELED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
            WithdrawalState.WITHDRAWAL_CANCELED,
          ),
        ).toBe(true);
      });
    });

    describe("valid transitions from WITHDRAWAL_PROCESSING", () => {
      it("should allow transition to WITHDRAWAL_COMMITTED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_PROCESSING,
            WithdrawalState.WITHDRAWAL_COMMITTED,
          ),
        ).toBe(true);
      });
    });

    describe("valid transitions from WITHDRAWAL_COMMITTED", () => {
      it("should allow transition to WITHDRAWAL_SUCCEEDED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_COMMITTED,
            WithdrawalState.WITHDRAWAL_SUCCEEDED,
          ),
        ).toBe(true);
      });

      it("should allow transition to WITHDRAWAL_FAILED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_COMMITTED,
            WithdrawalState.WITHDRAWAL_FAILED,
          ),
        ).toBe(true);
      });
    });

    describe("valid transitions from WITHDRAWAL_FAILED", () => {
      it("should allow transition to WITHDRAWAL_REFUNDED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_FAILED,
            WithdrawalState.WITHDRAWAL_REFUNDED,
          ),
        ).toBe(true);
      });
    });

    describe("terminal states (no transitions allowed)", () => {
      it("should not allow any transitions from WITHDRAWAL_REJECTED", () => {
        Object.values(WithdrawalState).forEach((toState) => {
          expect(
            stateMachine.canTransition(
              WithdrawalState.WITHDRAWAL_REJECTED,
              toState,
            ),
          ).toBe(false);
        });
      });

      it("should not allow any transitions from WITHDRAWAL_CANCELED", () => {
        Object.values(WithdrawalState).forEach((toState) => {
          expect(
            stateMachine.canTransition(
              WithdrawalState.WITHDRAWAL_CANCELED,
              toState,
            ),
          ).toBe(false);
        });
      });

      it("should not allow any transitions from WITHDRAWAL_SUCCEEDED", () => {
        Object.values(WithdrawalState).forEach((toState) => {
          expect(
            stateMachine.canTransition(
              WithdrawalState.WITHDRAWAL_SUCCEEDED,
              toState,
            ),
          ).toBe(false);
        });
      });

      it("should not allow any transitions from WITHDRAWAL_REFUNDED", () => {
        Object.values(WithdrawalState).forEach((toState) => {
          expect(
            stateMachine.canTransition(
              WithdrawalState.WITHDRAWAL_REFUNDED,
              toState,
            ),
          ).toBe(false);
        });
      });
    });

    describe("invalid transitions", () => {
      it("should not allow skipping states (CREATED -> PROCESSING)", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_CREATED,
            WithdrawalState.WITHDRAWAL_PROCESSING,
          ),
        ).toBe(false);
      });

      it("should not allow skipping states (CREATED -> COMMITTED)", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_CREATED,
            WithdrawalState.WITHDRAWAL_COMMITTED,
          ),
        ).toBe(false);
      });

      it("should not allow backward transitions (PROCESSING -> CREATED)", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_PROCESSING,
            WithdrawalState.WITHDRAWAL_CREATED,
          ),
        ).toBe(false);
      });

      it("should not allow transition to self", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_CREATED,
            WithdrawalState.WITHDRAWAL_CREATED,
          ),
        ).toBe(false);
      });

      it("should not allow FAILED -> SUCCEEDED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_FAILED,
            WithdrawalState.WITHDRAWAL_SUCCEEDED,
          ),
        ).toBe(false);
      });

      it("should not allow SUCCEEDED -> FAILED", () => {
        expect(
          stateMachine.canTransition(
            WithdrawalState.WITHDRAWAL_SUCCEEDED,
            WithdrawalState.WITHDRAWAL_FAILED,
          ),
        ).toBe(false);
      });
    });
  });

  describe("getAllowedTransitions", () => {
    it("should return correct transitions for WITHDRAWAL_CREATED", () => {
      const allowed = stateMachine.getAllowedTransitions(
        WithdrawalState.WITHDRAWAL_CREATED,
      );
      expect(allowed).toEqual([
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
        WithdrawalState.WITHDRAWAL_CANCELED,
      ]);
    });

    it("should return correct transitions for WITHDRAWAL_PENDING_VERIFICATION", () => {
      const allowed = stateMachine.getAllowedTransitions(
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );
      expect(allowed).toEqual([
        WithdrawalState.WITHDRAWAL_PROCESSING,
        WithdrawalState.WITHDRAWAL_REJECTED,
        WithdrawalState.WITHDRAWAL_CANCELED,
      ]);
    });

    it("should return correct transitions for WITHDRAWAL_PROCESSING", () => {
      const allowed = stateMachine.getAllowedTransitions(
        WithdrawalState.WITHDRAWAL_PROCESSING,
      );
      expect(allowed).toEqual([WithdrawalState.WITHDRAWAL_COMMITTED]);
    });

    it("should return correct transitions for WITHDRAWAL_COMMITTED", () => {
      const allowed = stateMachine.getAllowedTransitions(
        WithdrawalState.WITHDRAWAL_COMMITTED,
      );
      expect(allowed).toEqual([
        WithdrawalState.WITHDRAWAL_SUCCEEDED,
        WithdrawalState.WITHDRAWAL_FAILED,
      ]);
    });

    it("should return correct transitions for WITHDRAWAL_FAILED", () => {
      const allowed = stateMachine.getAllowedTransitions(
        WithdrawalState.WITHDRAWAL_FAILED,
      );
      expect(allowed).toEqual([WithdrawalState.WITHDRAWAL_REFUNDED]);
    });

    it("should return empty array for terminal states", () => {
      expect(
        stateMachine.getAllowedTransitions(WithdrawalState.WITHDRAWAL_REJECTED),
      ).toEqual([]);
      expect(
        stateMachine.getAllowedTransitions(WithdrawalState.WITHDRAWAL_CANCELED),
      ).toEqual([]);
      expect(
        stateMachine.getAllowedTransitions(
          WithdrawalState.WITHDRAWAL_SUCCEEDED,
        ),
      ).toEqual([]);
      expect(
        stateMachine.getAllowedTransitions(WithdrawalState.WITHDRAWAL_REFUNDED),
      ).toEqual([]);
    });
  });

  describe("transition", () => {
    it("should successfully transition a withdrawal to a valid state", () => {
      const withdrawal: Withdrawal = {
        id: "test-123",
        status: WithdrawalState.WITHDRAWAL_CREATED,
        amount: 100,
      };

      const result = stateMachine.transition(
        withdrawal,
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );

      expect(result.status).toBe(
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );
      expect(result.id).toBe("test-123");
      expect(result.amount).toBe(100);
    });

    it("should return a new object and not mutate the original", () => {
      const withdrawal: Withdrawal = {
        id: "test-123",
        status: WithdrawalState.WITHDRAWAL_CREATED,
      };

      const result = stateMachine.transition(
        withdrawal,
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );

      expect(result).not.toBe(withdrawal);
      expect(withdrawal.status).toBe(WithdrawalState.WITHDRAWAL_CREATED);
    });

    it("should throw InvalidStateTransitionError for invalid transitions", () => {
      const withdrawal: Withdrawal = {
        id: "test-123",
        status: WithdrawalState.WITHDRAWAL_CREATED,
      };

      expect(() => {
        stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_PROCESSING,
        );
      }).toThrow(InvalidStateTransitionError);
    });

    it("should include states in error message", () => {
      const withdrawal: Withdrawal = {
        id: "test-123",
        status: WithdrawalState.WITHDRAWAL_CREATED,
      };

      try {
        stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_PROCESSING,
        );
        fail("Expected InvalidStateTransitionError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidStateTransitionError);
        expect((error as Error).message).toContain("WITHDRAWAL_CREATED");
        expect((error as Error).message).toContain("WITHDRAWAL_PROCESSING");
      }
    });

    it("should preserve additional withdrawal properties during transition", () => {
      const withdrawal: Withdrawal = {
        id: "test-123",
        status: WithdrawalState.WITHDRAWAL_CREATED,
        amount: 500,
        userId: "user-456",
        currency: "USD",
        createdAt: new Date("2024-01-01"),
      };

      const result = stateMachine.transition(
        withdrawal,
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );

      expect(result.id).toBe("test-123");
      expect(result.amount).toBe(500);
      expect(result.userId).toBe("user-456");
      expect(result.currency).toBe("USD");
      expect(result.createdAt).toEqual(new Date("2024-01-01"));
    });

    describe("complete workflow transitions", () => {
      it("should support happy path: CREATED -> PENDING_VERIFICATION -> PROCESSING -> COMMITTED -> SUCCEEDED", () => {
        let withdrawal: Withdrawal = {
          id: "test-123",
          status: WithdrawalState.WITHDRAWAL_CREATED,
        };

        withdrawal = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
        );
        expect(withdrawal.status).toBe(
          WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
        );

        withdrawal = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_PROCESSING,
        );
        expect(withdrawal.status).toBe(WithdrawalState.WITHDRAWAL_PROCESSING);

        withdrawal = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_COMMITTED,
        );
        expect(withdrawal.status).toBe(WithdrawalState.WITHDRAWAL_COMMITTED);

        withdrawal = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_SUCCEEDED,
        );
        expect(withdrawal.status).toBe(WithdrawalState.WITHDRAWAL_SUCCEEDED);
      });

      it("should support failure path: COMMITTED -> FAILED -> REFUNDED", () => {
        let withdrawal: Withdrawal = {
          id: "test-123",
          status: WithdrawalState.WITHDRAWAL_COMMITTED,
        };

        withdrawal = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_FAILED,
        );
        expect(withdrawal.status).toBe(WithdrawalState.WITHDRAWAL_FAILED);

        withdrawal = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_REFUNDED,
        );
        expect(withdrawal.status).toBe(WithdrawalState.WITHDRAWAL_REFUNDED);
      });

      it("should support cancellation from CREATED", () => {
        const withdrawal: Withdrawal = {
          id: "test-123",
          status: WithdrawalState.WITHDRAWAL_CREATED,
        };

        const result = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_CANCELED,
        );
        expect(result.status).toBe(WithdrawalState.WITHDRAWAL_CANCELED);
      });

      it("should support cancellation from PENDING_VERIFICATION", () => {
        const withdrawal: Withdrawal = {
          id: "test-123",
          status: WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
        };

        const result = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_CANCELED,
        );
        expect(result.status).toBe(WithdrawalState.WITHDRAWAL_CANCELED);
      });

      it("should support rejection from PENDING_VERIFICATION", () => {
        const withdrawal: Withdrawal = {
          id: "test-123",
          status: WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
        };

        const result = stateMachine.transition(
          withdrawal,
          WithdrawalState.WITHDRAWAL_REJECTED,
        );
        expect(result.status).toBe(WithdrawalState.WITHDRAWAL_REJECTED);
      });
    });
  });

  describe("isTerminalState", () => {
    it("should return true for terminal states", () => {
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_REJECTED),
      ).toBe(true);
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_CANCELED),
      ).toBe(true);
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_SUCCEEDED),
      ).toBe(true);
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_REFUNDED),
      ).toBe(true);
    });

    it("should return false for non-terminal states", () => {
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_CREATED),
      ).toBe(false);
      expect(
        stateMachine.isTerminalState(
          WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
        ),
      ).toBe(false);
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_PROCESSING),
      ).toBe(false);
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_COMMITTED),
      ).toBe(false);
      expect(
        stateMachine.isTerminalState(WithdrawalState.WITHDRAWAL_FAILED),
      ).toBe(false);
    });
  });

  describe("isInitialState", () => {
    it("should return true for WITHDRAWAL_CREATED", () => {
      expect(
        stateMachine.isInitialState(WithdrawalState.WITHDRAWAL_CREATED),
      ).toBe(true);
    });

    it("should return false for all other states", () => {
      const nonInitialStates = Object.values(WithdrawalState).filter(
        (state) => state !== WithdrawalState.WITHDRAWAL_CREATED,
      );

      nonInitialStates.forEach((state) => {
        expect(stateMachine.isInitialState(state)).toBe(false);
      });
    });
  });

  describe("getAllStates", () => {
    it("should return all withdrawal states", () => {
      const allStates = stateMachine.getAllStates();

      expect(allStates).toHaveLength(9);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_CREATED);
      expect(allStates).toContain(
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_PROCESSING);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_REJECTED);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_CANCELED);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_COMMITTED);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_SUCCEEDED);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_FAILED);
      expect(allStates).toContain(WithdrawalState.WITHDRAWAL_REFUNDED);
    });
  });

  describe("getTerminalStates", () => {
    it("should return all terminal states", () => {
      const terminalStates = stateMachine.getTerminalStates();

      expect(terminalStates).toHaveLength(4);
      expect(terminalStates).toContain(WithdrawalState.WITHDRAWAL_REJECTED);
      expect(terminalStates).toContain(WithdrawalState.WITHDRAWAL_CANCELED);
      expect(terminalStates).toContain(WithdrawalState.WITHDRAWAL_SUCCEEDED);
      expect(terminalStates).toContain(WithdrawalState.WITHDRAWAL_REFUNDED);
    });

    it("should not include non-terminal states", () => {
      const terminalStates = stateMachine.getTerminalStates();

      expect(terminalStates).not.toContain(WithdrawalState.WITHDRAWAL_CREATED);
      expect(terminalStates).not.toContain(
        WithdrawalState.WITHDRAWAL_PENDING_VERIFICATION,
      );
      expect(terminalStates).not.toContain(
        WithdrawalState.WITHDRAWAL_PROCESSING,
      );
      expect(terminalStates).not.toContain(
        WithdrawalState.WITHDRAWAL_COMMITTED,
      );
      expect(terminalStates).not.toContain(WithdrawalState.WITHDRAWAL_FAILED);
    });
  });
});

describe("InvalidStateTransitionError", () => {
  it("should have correct name", () => {
    const error = new InvalidStateTransitionError(
      WithdrawalState.WITHDRAWAL_CREATED,
      WithdrawalState.WITHDRAWAL_PROCESSING,
    );

    expect(error.name).toBe("InvalidStateTransitionError");
  });

  it("should have informative error message", () => {
    const error = new InvalidStateTransitionError(
      WithdrawalState.WITHDRAWAL_CREATED,
      WithdrawalState.WITHDRAWAL_PROCESSING,
    );

    expect(error.message).toContain("WITHDRAWAL_CREATED");
    expect(error.message).toContain("WITHDRAWAL_PROCESSING");
  });

  it("should be an instance of Error", () => {
    const error = new InvalidStateTransitionError(
      WithdrawalState.WITHDRAWAL_CREATED,
      WithdrawalState.WITHDRAWAL_PROCESSING,
    );

    expect(error).toBeInstanceOf(Error);
  });
});
