-- Migration: Implement Withdrawal System
-- Description: Creates withdrawals and withdrawal_audit_logs tables, and adds release_balance RPC function

-- 1. Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'CREATED',
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for withdrawals
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at);

-- 2. Create withdrawal_audit_logs table
CREATE TABLE IF NOT EXISTS withdrawal_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_id UUID NOT NULL REFERENCES withdrawals(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL,
    previous_status VARCHAR NOT NULL,
    new_status VARCHAR NOT NULL,
    reason TEXT,
    correlation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for audit logs
CREATE INDEX idx_withdrawal_audit_logs_withdrawal_id ON withdrawal_audit_logs(withdrawal_id);
CREATE INDEX idx_withdrawal_audit_logs_created_at ON withdrawal_audit_logs(created_at);

-- 3. Create release_balance RPC function
-- Atomic function to return held funds back to available balance
CREATE OR REPLACE FUNCTION release_balance(
    p_user_id UUID,
    p_amount DECIMAL(18, 8),
    p_currency VARCHAR,
    p_ref_id VARCHAR,
    p_ref_type VARCHAR,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance_before DECIMAL(18, 8);
    v_balance_after DECIMAL(18, 8);
    v_balance_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Get current balance with PESSIMISTIC LOCK
    SELECT available, id INTO v_balance_before, v_balance_id
    FROM balances 
    WHERE user_id = p_user_id AND currency = p_currency
    FOR UPDATE;

    -- 2. Validate balance exists
    IF v_balance_id IS NULL THEN
        RAISE EXCEPTION 'Balance record not found for user % and currency %', p_user_id, p_currency;
    END IF;

    -- 3. Calculate new balance
    v_balance_after := COALESCE(v_balance_before, 0) + p_amount;

    -- 4. Update Balance Record
    UPDATE balances 
    SET available = v_balance_after, updated_at = NOW()
    WHERE id = v_balance_id;

    -- 5. Create Transaction Log Record
    INSERT INTO balance_transactions 
    (user_id, amount, currency, type, reference_id, reference_type, balance_before, balance_after, description)
    VALUES 
    (p_user_id, p_amount, p_currency, 'release', p_ref_id, p_ref_type, v_balance_before, v_balance_after, p_description);

    -- 6. Return the updated balance object
    SELECT jsonb_build_object(
        'id', id,
        'user_id', user_id,
        'currency', currency,
        'available', available,
        'held', held,
        'updated_at', updated_at,
        'created_at', created_at
    ) INTO v_result
    FROM balances WHERE id = v_balance_id;

    RETURN v_result;
END;
$$;

-- Comentarios para documentación
COMMENT ON TABLE withdrawals IS 'Stores withdrawal requests from users.';
COMMENT ON TABLE withdrawal_audit_logs IS 'Audit log for withdrawal status changes and actions.';
COMMENT ON FUNCTION release_balance IS 'Atomically releases funds back to available balance and logs the transaction.';
