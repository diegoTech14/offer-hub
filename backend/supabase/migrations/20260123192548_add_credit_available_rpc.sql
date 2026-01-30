-- Migration: Create credit_available_balance RPC function
-- Depends on: balances, balance_transactions tables existing

CREATE OR REPLACE FUNCTION credit_available_balance(
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
    v_balance_before DECIMAL(18, 8);
    v_balance_after DECIMAL(18, 8);
    v_balance_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Get current balance with PESSIMISTIC LOCK
    -- The 'FOR UPDATE' clause locks this specific row.
    -- If another transaction tries to read/write this user's USD balance,
    -- it must wait until this transaction finishes.
    SELECT available, id INTO v_balance_before, v_balance_id
    FROM balances 
    WHERE user_id = p_user_id AND currency = p_currency
    FOR UPDATE; 

    -- 2. Initialize Balance if it doesn't exist
    IF v_balance_before IS NULL THEN
        v_balance_before := 0;
        
        INSERT INTO balances (user_id, currency, available, held)
        VALUES (p_user_id, p_currency, 0, 0)
        RETURNING id INTO v_balance_id;
    END IF;

    -- 3. Calculate new balance
    v_balance_after := v_balance_before + p_amount;

    -- 4. Update Balance Record
    UPDATE balances 
    SET available = v_balance_after, updated_at = NOW()
    WHERE id = v_balance_id;

    -- 5. Create Transaction Log Record
    INSERT INTO balance_transactions 
    (user_id, amount, currency, type, reference_id, reference_type, balance_before, balance_after, description)
    VALUES 
    (p_user_id, p_amount, p_currency, 'credit', p_ref_id, p_ref_type, v_balance_before, v_balance_after, p_description);

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