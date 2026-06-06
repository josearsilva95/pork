-- ============================================================
-- FINANCEFLOW - Row Level Security Policies
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if user is member of a household
CREATE OR REPLACE FUNCTION is_household_member(p_household_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM household_members
        WHERE household_id = p_household_id
        AND user_id = auth.uid()
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's household IDs
CREATE OR REPLACE FUNCTION get_user_household_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT household_id FROM household_members
        WHERE user_id = auth.uid() AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- USERS POLICIES
-- ============================================================
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- HOUSEHOLDS POLICIES
-- ============================================================
CREATE POLICY "households_select_member" ON households
    FOR SELECT USING (
        is_household_member(id) AND deleted_at IS NULL
    );

CREATE POLICY "households_insert_owner" ON households
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "households_update_owner" ON households
    FOR UPDATE USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "households_delete_owner" ON households
    FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- HOUSEHOLD MEMBERS POLICIES
-- ============================================================
CREATE POLICY "household_members_select_member" ON household_members
    FOR SELECT USING (is_household_member(household_id));

CREATE POLICY "household_members_insert_admin" ON household_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM household_members hm
            WHERE hm.household_id = household_id
            AND hm.user_id = auth.uid()
            AND hm.role IN ('owner', 'admin')
            AND hm.is_active = TRUE
        )
    );

CREATE POLICY "household_members_update_admin" ON household_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM household_members hm
            WHERE hm.household_id = household_id
            AND hm.user_id = auth.uid()
            AND hm.role IN ('owner', 'admin')
            AND hm.is_active = TRUE
        )
    );

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================
CREATE POLICY "categories_select_own_or_system" ON categories
    FOR SELECT USING (
        is_system = TRUE
        OR user_id = auth.uid()
        OR (household_id IS NOT NULL AND is_household_member(household_id))
    );

CREATE POLICY "categories_insert_own" ON categories
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        OR (household_id IS NOT NULL AND is_household_member(household_id))
    );

CREATE POLICY "categories_update_own" ON categories
    FOR UPDATE USING (user_id = auth.uid() AND is_system = FALSE);

CREATE POLICY "categories_delete_own" ON categories
    FOR DELETE USING (user_id = auth.uid() AND is_system = FALSE);

-- ============================================================
-- ACCOUNTS POLICIES
-- ============================================================
CREATE POLICY "accounts_select_own_or_household" ON accounts
    FOR SELECT USING (
        deleted_at IS NULL AND (
            user_id = auth.uid()
            OR (household_id IS NOT NULL AND is_household_member(household_id))
        )
    );

CREATE POLICY "accounts_insert_own" ON accounts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "accounts_update_own" ON accounts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "accounts_delete_own" ON accounts
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- CARDS POLICIES
-- ============================================================
CREATE POLICY "cards_select_own_or_household" ON cards
    FOR SELECT USING (
        deleted_at IS NULL AND (
            user_id = auth.uid()
            OR (household_id IS NOT NULL AND is_household_member(household_id))
        )
    );

CREATE POLICY "cards_insert_own" ON cards
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cards_update_own" ON cards
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "cards_delete_own" ON cards
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- TRANSACTIONS POLICIES
-- ============================================================
CREATE POLICY "transactions_select_own_or_household" ON transactions
    FOR SELECT USING (
        deleted_at IS NULL AND (
            user_id = auth.uid()
            OR (household_id IS NOT NULL AND is_household_member(household_id))
        )
    );

CREATE POLICY "transactions_insert_own" ON transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_update_own" ON transactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "transactions_delete_own" ON transactions
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- INVESTMENTS POLICIES
-- ============================================================
CREATE POLICY "investments_select_own_or_household" ON investments
    FOR SELECT USING (
        deleted_at IS NULL AND (
            user_id = auth.uid()
            OR (household_id IS NOT NULL AND is_household_member(household_id))
        )
    );

CREATE POLICY "investments_insert_own" ON investments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "investments_update_own" ON investments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "investments_delete_own" ON investments
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- INVESTMENT HISTORY POLICIES
-- ============================================================
CREATE POLICY "investment_history_select_own" ON investment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM investments i
            WHERE i.id = investment_id
            AND (i.user_id = auth.uid() OR is_household_member(i.household_id))
        )
    );

-- ============================================================
-- GOALS POLICIES
-- ============================================================
CREATE POLICY "goals_select_own_or_household" ON goals
    FOR SELECT USING (
        user_id = auth.uid()
        OR (household_id IS NOT NULL AND is_household_member(household_id))
    );

CREATE POLICY "goals_insert_own" ON goals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update_own" ON goals
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
CREATE POLICY "audit_logs_select_own" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "audit_logs_insert_own" ON audit_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SYSTEM CATEGORIES SEED
-- ============================================================
INSERT INTO categories (name, icon, color, type, is_system) VALUES
-- Expenses
('Alimentação',     '🍔', '#ef4444', 'expense', TRUE),
('Moradia',         '🏠', '#f97316', 'expense', TRUE),
('Transporte',      '🚗', '#eab308', 'expense', TRUE),
('Saúde',           '🏥', '#22c55e', 'expense', TRUE),
('Educação',        '📚', '#3b82f6', 'expense', TRUE),
('Lazer',           '🎮', '#8b5cf6', 'expense', TRUE),
('Vestuário',       '👕', '#ec4899', 'expense', TRUE),
('Tecnologia',      '💻', '#06b6d4', 'expense', TRUE),
('Viagem',          '✈️', '#0ea5e9', 'expense', TRUE),
('Assinaturas',     '📱', '#6366f1', 'expense', TRUE),
('Impostos',        '🧾', '#64748b', 'expense', TRUE),
('Outros Gastos',   '💸', '#94a3b8', 'expense', TRUE),
-- Income
('Salário',         '💰', '#22c55e', 'income',  TRUE),
('Freelance',       '💻', '#10b981', 'income',  TRUE),
('Investimentos',   '📈', '#3b82f6', 'income',  TRUE),
('Aluguel',         '🏡', '#f59e0b', 'income',  TRUE),
('Bônus',           '🎁', '#8b5cf6', 'income',  TRUE),
('Outros Ingresos', '💵', '#94a3b8', 'income',  TRUE),
-- Investment
('Renda Fixa',      '📊', '#3b82f6', 'investment', TRUE),
('Renda Variável',  '📈', '#8b5cf6', 'investment', TRUE),
('Criptomoedas',    '₿',  '#f59e0b', 'investment', TRUE),
-- Transfer
('Transferência',   '🔄', '#64748b', 'transfer', TRUE)
ON CONFLICT DO NOTHING;