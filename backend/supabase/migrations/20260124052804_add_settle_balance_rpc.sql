-- Migration: Create settle_balance RPC function
-- Depends on: balances, balance_transactions tables existing
-- Description: Atomic function to transfer held funds from one user to another's available balance

CREATE OR REPLACE FUNCTION settle_balance(
    p_from_user_id UUID,
    p_to_user_id UUID,
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
    v_from_held_before DECIMAL(18, 8);
    v_from_held_after DECIMAL(18, 8);
    v_from_balance_id UUID;
    v_to_available_before DECIMAL(18, 8);
    v_to_available_after DECIMAL(18, 8);
    v_to_balance_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Lock and get fromUser balance with PESSIMISTIC LOCK
    -- Lock order: always lock by user_id to prevent deadlocks
    -- We lock the smaller UUID first to ensure consistent lock ordering
    IF p_from_user_id < p_to_user_id THEN
        -- Lock fromUser first
        SELECT held, id INTO v_from_held_before, v_from_balance_id
        FROM balances 
        WHERE user_id = p_from_user_id AND currency = p_currency
        FOR UPDATE;
        
        -- Lock toUser second
        SELECT available, id INTO v_to_available_before, v_to_balance_id
        FROM balances 
        WHERE user_id = p_to_user_id AND currency = p_currency
        FOR UPDATE;
    ELSE
        -- Lock toUser first
        SELECT available, id INTO v_to_available_before, v_to_balance_id
        FROM balances 
        WHERE user_id = p_to_user_id AND currency = p_currency
        FOR UPDATE;
        
        -- Lock fromUser second
        SELECT held, id INTO v_from_held_before, v_from_balance_id
        FROM balances 
        WHERE user_id = p_from_user_id AND currency = p_currency
        FOR UPDATE;
    END IF;

    -- 2. Validate fromUser has sufficient held balance
    IF v_from_held_before IS NULL THEN
        RAISE EXCEPTION 'Insufficient held balance: fromUser has no balance record for currency %', p_currency;
    END IF;

    IF v_from_held_before < p_amount THEN
        RAISE EXCEPTION 'Insufficient held balance: required %, but only % available', p_amount, v_from_held_before;
    END IF;

    -- 3. Initialize toUser balance if it doesn't exist
    IF v_to_available_before IS NULL THEN
        v_to_available_before := 0;
        
        INSERT INTO balances (user_id, currency, available, held)
        VALUES (p_to_user_id, p_currency, 0, 0)
        RETURNING id INTO v_to_balance_id;
    END IF;

    -- 4. Calculate new balances
    v_from_held_after := v_from_held_before - p_amount;
    v_to_available_after := v_to_available_before + p_amount;

    -- 5. Update fromUser balance (decrement held)
    UPDATE balances 
    SET held = v_from_held_after, updated_at = NOW()
    WHERE id = v_from_balance_id;

    -- 6. Update toUser balance (increment available)
    UPDATE balances 
    SET available = v_to_available_after, updated_at = NOW()
    WHERE id = v_to_balance_id;

    -- 7. Create settle_out transaction for fromUser
    INSERT INTO balance_transactions 
    (user_id, amount, currency, type, reference_id, reference_type, balance_before, balance_after, description)
    VALUES 
    (p_from_user_id, p_amount, p_currency, 'settle_out', p_ref_id, p_ref_type, v_from_held_before, v_from_held_after, p_description);

    -- 8. Create settle_in transaction for toUser
    INSERT INTO balance_transactions 
    (user_id, amount, currency, type, reference_id, reference_type, balance_before, balance_after, description)
    VALUES 
    (p_to_user_id, p_amount, p_currency, 'settle_in', p_ref_id, p_ref_type, v_to_available_before, v_to_available_after, p_description);

    -- 9. Return both updated balance objects
    SELECT jsonb_build_object(
        'fromBalance', (
            SELECT jsonb_build_object(
                'id', id,
                'user_id', user_id,
                'currency', currency,
                'available', available,
                'held', held,
                'created_at', created_at,
                'updated_at', updated_at
            )
            FROM balances WHERE id = v_from_balance_id
        ),
        'toBalance', (
            SELECT jsonb_build_object(
                'id', id,
                'user_id', user_id,
                'currency', currency,
                'available', available,
                'held', held,
                'created_at', created_at,
                'updated_at', updated_at
            )
            FROM balances WHERE id = v_to_balance_id
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;
