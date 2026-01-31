-- Migration: Create hold_balance RPC function
-- Depends on: balances, balance_transactions tables existing
-- Description: Atomic function to hold funds from a user's available balance

CREATE OR REPLACE FUNCTION hold_balance(
    p_user_id UUID,
    p_amount DECIMAL(18, 8),
    p_currency VARCHAR,
    p_ref_id VARCHAR,
    p_ref_type VARCHAR,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS if strictly needed
AS $$
DECLARE
    v_available_before DECIMAL(18, 8);
    v_held_before DECIMAL(18, 8);
    v_available_after DECIMAL(18, 8);
    v_held_after DECIMAL(18, 8);
    v_balance_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Get current balance with PESSIMISTIC LOCK
    SELECT available, held, id INTO v_available_before, v_held_before, v_balance_id
    FROM balances 
    WHERE user_id = p_user_id AND currency = p_currency
    FOR UPDATE;

    -- 2. Validate balance exists
    IF v_available_before IS NULL THEN
        RAISE EXCEPTION 'Insufficient funds: user has no balance record for currency %', p_currency;
    END IF;

    -- 3. Validate sufficient available funds
    IF v_available_before < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds: required %, but only % available', p_amount, v_available_before;
    END IF;

    -- 4. Calculate new balances
    v_available_after := v_available_before - p_amount;
    v_held_after := v_held_before + p_amount;

    -- 5. Update Balance Record
    UPDATE balances 
    SET available = v_available_after, held = v_held_after, updated_at = NOW()
    WHERE id = v_balance_id;

    -- 6. Create Transaction Log Record
    -- Note: We log the change in available balance mainly? Or logic suggests 'hold' type implies transfer from available to held.
    -- We'll log it as 'hold' type.
    INSERT INTO balance_transactions 
    (user_id, amount, currency, type, reference_id, reference_type, balance_before, balance_after, description)
    VALUES 
    (p_user_id, p_amount, p_currency, 'hold', p_ref_id, p_ref_type, v_available_before, v_available_after, p_description);

    -- 7. Return the updated balance object
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
