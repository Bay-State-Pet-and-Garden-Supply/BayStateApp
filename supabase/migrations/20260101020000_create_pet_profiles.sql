-- Pet Profile Feature: pet_types and user_pets tables
-- Enables members to register their pets for personalized recommendations

BEGIN;

-- ============================================================================
-- 1. Pet Types Reference Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS pet_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    display_order int DEFAULT 0,
    icon text,
    created_at timestamptz DEFAULT now()
);

-- Seed common pet types
INSERT INTO pet_types (name, display_order, icon) VALUES
    ('Dog', 1, 'dog'),
    ('Cat', 2, 'cat'),
    ('Bird', 3, 'bird'),
    ('Fish', 4, 'fish'),
    ('Reptile', 5, 'turtle'),
    ('Small Animal', 6, 'rabbit'),
    ('Horse', 7, 'horse'),
    ('Livestock', 8, 'farm')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. User Pets Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_pets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pet_type_id uuid NOT NULL REFERENCES pet_types(id) ON DELETE RESTRICT,
    name text NOT NULL,
    breed text,
    birth_date date,
    weight_lbs decimal(6,2),
    dietary_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_pets_user_id ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_pet_type_id ON user_pets(pet_type_id);

-- ============================================================================
-- 3. Enable RLS
-- ============================================================================

ALTER TABLE pet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;

-- Pet types are publicly readable
DROP POLICY IF EXISTS "Allow public read access to pet_types" ON pet_types;
CREATE POLICY "Allow public read access to pet_types"
    ON pet_types FOR SELECT
    USING (true);

-- Admin can manage pet types
DROP POLICY IF EXISTS "Allow admin write access to pet_types" ON pet_types;
CREATE POLICY "Allow admin write access to pet_types"
    ON pet_types FOR ALL
    USING (public.is_admin());

-- Users can view their own pets
DROP POLICY IF EXISTS "Users can view own pets" ON user_pets;
CREATE POLICY "Users can view own pets"
    ON user_pets FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own pets
DROP POLICY IF EXISTS "Users can insert own pets" ON user_pets;
CREATE POLICY "Users can insert own pets"
    ON user_pets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pets
DROP POLICY IF EXISTS "Users can update own pets" ON user_pets;
CREATE POLICY "Users can update own pets"
    ON user_pets FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own pets
DROP POLICY IF EXISTS "Users can delete own pets" ON user_pets;
CREATE POLICY "Users can delete own pets"
    ON user_pets FOR DELETE
    USING (auth.uid() = user_id);

-- Staff/Admin can view all pets for analytics
DROP POLICY IF EXISTS "Staff can view all pets" ON user_pets;
CREATE POLICY "Staff can view all pets"
    ON user_pets FOR SELECT
    USING (public.is_staff());

COMMIT;
