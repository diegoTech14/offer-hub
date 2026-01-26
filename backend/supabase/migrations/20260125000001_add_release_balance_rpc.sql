-- Migration: Create release_balance RPC function
-- Depends on: balances, balance_transactions tables existing
-- Description: Atomic function to move funds from held back to available balance

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
SECURITY DEFINER -- Runs with owner privileges to bypass RLS if strictly needed for transaction log
AS $$
DECLARE
    v_available_before DECIMAL(18, 8);
    v_held_before DECIMAL(18, 8);
    v_balance_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Get current balance with PESSIMISTIC LOCK
    -- The 'FOR UPDATE' clause locks this specific row.
    -- If another transaction tries to read/write this user's balance,
    -- it must wait until this transaction finishes.
    SELECT available, held, id INTO v_available_before, v_held_before, v_balance_id
    FROM balances
    WHERE user_id = p_user_id AND currency = p_currency
    FOR UPDATE;

    -- 2. Validate balance exists
    IF v_held_before IS NULL THEN
        RAISE EXCEPTION 'Insufficient held balance: user has no balance record for currency %', p_currency;
    END IF;

    -- 3. Validate sufficient held funds
    IF v_held_before < p_amount THEN
        RAISE EXCEPTION 'Insufficient held balance: required %, but only % held', p_amount, v_held_before;
    END IF;

    -- 4. Update Balance Record (decrement held, increment available)
    UPDATE balances
    SET
        available = available + p_amount,
        held = held - p_amount,
        updated_at = NOW()
    WHERE id = v_balance_id;

    -- 5. Create Transaction Log Record
    INSERT INTO balance_transactions
    (user_id, amount, currency, type, reference_id, reference_type, balance_before, balance_after, description)
    VALUES
    (p_user_id, p_amount, p_currency, 'release', p_ref_id, p_ref_type, v_held_before, v_held_before - p_amount, p_description);

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
