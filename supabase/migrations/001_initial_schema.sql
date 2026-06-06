-- ============================================================
-- FINANCEFLOW - Initial Schema Migration
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (managed by Supabase Auth, extended here)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    phone           TEXT,
    currency        TEXT NOT NULL DEFAULT 'BRL',
    timezone        TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

-- ============================================================
-- HOUSEHOLDS (conta casal / grupo familiar)
-- ============================================================
CREATE TABLE IF NOT EXISTS households (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    description TEXT,
    currency    TEXT NOT NULL DEFAULT 'BRL',
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS household_members (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(household_id, user_id)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    icon         TEXT,
    color        TEXT DEFAULT '#6366f1',
    type         TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'transfer')),
    is_system    BOOLEAN NOT NULL DEFAULT FALSE,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACCOUNTS (contas financeiras)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id   UUID REFERENCES households(id) ON DELETE SET NULL,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'wallet', 'cash', 'investment', 'other')),
    bank           TEXT,
    bank_code      TEXT,
    initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance        DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency       TEXT NOT NULL DEFAULT 'BRL',
    color          TEXT DEFAULT '#6366f1',
    icon           TEXT,
    is_shared      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    include_in_net BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

-- ============================================================
-- CARDS (cartões de crédito/débito)
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id   UUID REFERENCES households(id) ON DELETE SET NULL,
    account_id     UUID REFERENCES accounts(id) ON DELETE SET NULL,
    name           TEXT NOT NULL,
    brand          TEXT CHECK (brand IN ('visa', 'mastercard', 'amex', 'elo', 'hipercard', 'other')),
    last_four      TEXT,
    limit_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
    used_amount    DECIMAL(15,2) NOT NULL DEFAULT 0,
    closing_day    INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
    due_day        INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    color          TEXT DEFAULT '#6366f1',
    is_shared      BOOLEAN NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id      UUID REFERENCES households(id) ON DELETE SET NULL,
    account_id        UUID REFERENCES accounts(id) ON DELETE SET NULL,
    card_id           UUID REFERENCES cards(id) ON DELETE SET NULL,
    category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    type              TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'investment')),
    amount            DECIMAL(15,2) NOT NULL,
    description       TEXT NOT NULL,
    notes             TEXT,
    date              DATE NOT NULL,
    due_date          DATE,
    paid_at           TIMESTAMPTZ,
    is_paid           BOOLEAN NOT NULL DEFAULT FALSE,
    is_recurring      BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_id     UUID,
    recurrence_rule   TEXT,
    installment_num   INTEGER,
    installment_total INTEGER,
    tags              TEXT[],
    attachment_url    TEXT,
    is_shared         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

-- ============================================================
-- INVESTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS investments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id    UUID REFERENCES households(id) ON DELETE SET NULL,
    account_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    ticker          TEXT,
    type            TEXT NOT NULL CHECK (type IN (
        'tesouro_direto', 'cdb', 'lci', 'lca', 'cri', 'cra',
        'debenture', 'stocks', 'fiis', 'etf', 'bdr',
        'crypto', 'fund', 'savings', 'other'
    )),
    broker          TEXT,
    quantity        DECIMAL(20,8) NOT NULL DEFAULT 0,
    avg_price       DECIMAL(15,6) NOT NULL DEFAULT 0,
    current_price   DECIMAL(15,6),
    invested_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    current_value   DECIMAL(15,2),
    profit_loss     DECIMAL(15,2) GENERATED ALWAYS AS (
        COALESCE(current_value, 0) - invested_amount
    ) STORED,
    return_rate     DECIMAL(10,4),
    maturity_date   DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS investment_history (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    date          DATE NOT NULL,
    price         DECIMAL(15,6) NOT NULL,
    quantity      DECIMAL(20,8) NOT NULL,
    total_value   DECIMAL(15,2) NOT NULL,
    return_rate   DECIMAL(10,4),
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS budgets (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
    name         TEXT NOT NULL,
    amount       DECIMAL(15,2) NOT NULL,
    period       TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
    month        INTEGER CHECK (month BETWEEN 1 AND 12),
    year         INTEGER,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GOALS (metas financeiras)
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    household_id    UUID REFERENCES households(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    target_amount   DECIMAL(15,2) NOT NULL,
    current_amount  DECIMAL(15,2) NOT NULL DEFAULT 0,
    target_date     DATE,
    color           TEXT DEFAULT '#6366f1',
    icon            TEXT,
    is_shared       BOOLEAN NOT NULL DEFAULT FALSE,
    is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    table_name  TEXT NOT NULL,
    record_id   UUID,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_user_id ON accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_household_id ON accounts(household_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cards_user_id ON cards(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_user_id ON transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_date ON transactions(date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_account_id ON transactions(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_category_id ON transactions(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_household_id ON transactions(household_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_investments_user_id ON investments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_investment_history_investment_id ON investment_history(investment_id);
CREATE INDEX idx_investment_history_date ON investment_history(date DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();