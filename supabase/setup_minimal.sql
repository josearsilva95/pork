-- Execute este SQL no Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CONTAS
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'checking',
    balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- TRANSAÇÕES
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income','expense','transfer')),
    amount NUMERIC(15,2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT TRUE,
    category_id UUID,
    account_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- INVESTIMENTOS
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'other',
    ticker TEXT,
    invested_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    current_value NUMERIC(15,2),
    quantity NUMERIC(20,8) DEFAULT 1,
    avg_price NUMERIC(15,6) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- CARTÕES
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT DEFAULT 'other',
    last_four TEXT,
    limit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    used_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    closing_day INTEGER NOT NULL,
    due_day INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- RLS (segurança: cada usuário vê só seus dados)
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_accounts"     ON accounts     USING (user_id = auth.uid());
CREATE POLICY "own_transactions" ON transactions USING (user_id = auth.uid());
CREATE POLICY "own_investments"  ON investments  USING (user_id = auth.uid());
CREATE POLICY "own_cards"        ON cards        USING (user_id = auth.uid());