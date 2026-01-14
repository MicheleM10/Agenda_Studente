-- ============================================
-- DATABASE SCHEMA FOR MicheleM10 Agenda
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ORARIO (Schedule Table)
-- ============================================
CREATE TABLE IF NOT EXISTS orario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Unique ID per entry
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Foreign key reference for users
    schedule_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- JSONB column for flexible data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- Ensure each user has a unique schedule
);

-- Enforce RLS
ALTER TABLE orario ENABLE ROW LEVEL SECURITY;

-- Policies for "orario"
CREATE POLICY "View own schedule" ON orario
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own schedule" ON orario
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own schedule" ON orario
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own schedule" ON orario
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- COMPITI (Tasks Table)
-- ============================================
CREATE TABLE IF NOT EXISTS compiti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Unique ID per task
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- User association
    text TEXT NOT NULL, -- Task description
    completed BOOLEAN DEFAULT FALSE, -- Task completion flag
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce RLS
ALTER TABLE compiti ENABLE ROW LEVEL SECURITY;

-- Policies for "compiti"
CREATE POLICY "View own tasks" ON compiti
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own tasks" ON compiti
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own tasks" ON compiti
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own tasks" ON compiti
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- APPUNTI (Notes Table)
-- ============================================
CREATE TABLE IF NOT EXISTS appunti (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Unique ID per note
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titolo TEXT NOT NULL,
    contenuto TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce RLS
ALTER TABLE appunti ENABLE ROW LEVEL SECURITY;

-- Policies for "appunti"
CREATE POLICY "View own notes" ON appunti
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own notes" ON appunti
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own notes" ON appunti
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Delete own notes" ON appunti
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FILES (Optional Enhancements for File Uploads)
-- ============================================
CREATE TABLE IF NOT EXISTS files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Unique ID per file
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, file_name) -- Prevent duplicate file names per user
);

-- Enforce RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies for "files"
CREATE POLICY "View own files" ON files
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own files" ON files
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Delete own files" ON files
    FOR DELETE USING (auth.uid() = user_id);
