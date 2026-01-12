-- ============================================
-- DATABASE SCHEMA FOR MicheleM10 Agenda_Studente
-- ============================================

-- ORARIO (Schedule Table)
CREATE TABLE IF NOT EXISTS orario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    schedule_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table: COMPITI
CREATE TABLE IF NOT EXISTS compiti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for security (user-specific access)
ALTER TABLE orario ENABLE ROW LEVEL SECURITY;
ALTER TABLE compiti ENABLE ROW LEVEL SECURITY;

-- Example Policies:
CREATE POLICY "Select_orario" ON orario FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert_orario" ON orario FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Select_compiti" ON compiti FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert_compiti" ON compiti FOR INSERT WITH CHECK (auth.uid() = user_id);