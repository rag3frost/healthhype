-- Drop existing table and policies if they exist
DROP POLICY IF EXISTS "Users can view own skin assessments" ON skin_assessments;
DROP POLICY IF EXISTS "Users can insert own skin assessments" ON skin_assessments;
DROP TABLE IF EXISTS skin_assessments;

-- Create skin_assessments table
CREATE TABLE skin_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    diagnosis TEXT NOT NULL,
    possible_causes TEXT,
    recommendations TEXT,
    risk_level TEXT NOT NULL,
    symptoms TEXT,
    body_location TEXT,
    duration TEXT,
    previous_treatments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE skin_assessments ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own assessments
CREATE POLICY "Users can view own skin assessments"
    ON skin_assessments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own assessments
CREATE POLICY "Users can insert own skin assessments"
    ON skin_assessments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON skin_assessments TO authenticated;
GRANT USAGE ON SEQUENCE skin_assessments_id_seq TO authenticated;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS skin_assessments_user_id_idx ON skin_assessments(user_id);
CREATE INDEX IF NOT EXISTS skin_assessments_created_at_idx ON skin_assessments(created_at);

-- Verify table exists and has correct permissions
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'skin_assessments'
    ) THEN
        RAISE EXCEPTION 'Table skin_assessments does not exist';
    END IF;

    -- Check if RLS is enabled
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'skin_assessments'
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on skin_assessments';
    END IF;
END $$;
