-- Drop existing tables and policies
DROP POLICY IF EXISTS "Users can view own skin assessments" ON skin_assessments;
DROP POLICY IF EXISTS "Users can insert own skin assessments" ON skin_assessments;
DROP POLICY IF EXISTS "Users can update own skin assessments" ON skin_assessments;
DROP POLICY IF EXISTS "Users can delete own skin assessments" ON skin_assessments;
DROP TABLE IF EXISTS skin_assessments;
DROP TABLE IF EXISTS nutrition_tracking;
DROP TABLE IF EXISTS cardio_assessments;
DROP TABLE IF EXISTS cancer_assessments;
DROP TABLE IF EXISTS diabetes_assessments;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS nutrition_plans;
DROP TABLE IF EXISTS food_logs;

-- Create profiles table with updated fields
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    avatar_url TEXT,
    health_conditions TEXT[],
    medications TEXT[],
    allergies TEXT[],
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create diabetes_assessments table
CREATE TABLE diabetes_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    gender TEXT,
    age INTEGER,
    hypertension BOOLEAN,
    heart_disease BOOLEAN,
    smoking_history TEXT,
    bmi DECIMAL,
    hba1c_level DECIMAL,
    blood_glucose_level INTEGER,
    risk_level TEXT NOT NULL,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cancer_assessments table
CREATE TABLE cancer_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    gender TEXT,
    age INTEGER,
    bmi DECIMAL,
    smoking BOOLEAN,
    genetic_risk INTEGER,
    physical_activity DECIMAL,
    alcohol_intake DECIMAL,
    cancer_history BOOLEAN,
    risk_level TEXT NOT NULL,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cardio_assessments table
CREATE TABLE cardio_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    age INTEGER,
    gender TEXT,
    height INTEGER,
    weight DECIMAL,
    ap_hi INTEGER,
    ap_lo INTEGER,
    cholesterol INTEGER,
    gluc INTEGER,
    smoke BOOLEAN,
    alco BOOLEAN,
    active BOOLEAN,
    risk_level TEXT NOT NULL,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated skin_assessments table
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
    image_url TEXT,
    confidence_score DECIMAL,
    follow_up_required BOOLEAN DEFAULT false,
    treatment_plan JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create nutrition_plans table
CREATE TABLE public.nutrition_plans (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    daily_calories integer not null,
    protein_percentage numeric not null,
    carbs_percentage numeric not null,
    fats_percentage numeric not null,
    workout_plan jsonb not null,
    meal_plan jsonb not null,
    tips text[] not null,
    goals jsonb not null,
    updated_at timestamptz default now() not null
);

-- Create food_logs table
CREATE TABLE public.food_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    meal_type text not null,
    food_items jsonb not null,
    total_calories integer not null,
    protein_grams numeric not null,
    carbs_grams numeric not null,
    fats_grams numeric not null,
    image_url text,
    notes text,
    updated_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diabetes_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancer_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardio_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- Create enhanced policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Create policies for diabetes_assessments
CREATE POLICY "Users can view own diabetes assessments" ON diabetes_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diabetes assessments" ON diabetes_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diabetes assessments" ON diabetes_assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diabetes assessments" ON diabetes_assessments
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for cancer_assessments
CREATE POLICY "Users can view own cancer assessments" ON cancer_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cancer assessments" ON cancer_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cancer assessments" ON cancer_assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cancer assessments" ON cancer_assessments
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for cardio_assessments
CREATE POLICY "Users can view own cardio assessments" ON cardio_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cardio assessments" ON cardio_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cardio assessments" ON cardio_assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cardio assessments" ON cardio_assessments
    FOR DELETE USING (auth.uid() = user_id);

-- Create enhanced policies for skin_assessments
CREATE POLICY "Users can view own skin assessments" ON skin_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own skin assessments" ON skin_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skin assessments" ON skin_assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skin assessments" ON skin_assessments
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for nutrition_plans
CREATE POLICY "Users can view their own nutrition plans"
    ON public.nutrition_plans
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition plans"
    ON public.nutrition_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition plans"
    ON public.nutrition_plans
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for food_logs
CREATE POLICY "Users can view their own food logs"
    ON public.food_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food logs"
    ON public.food_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food logs"
    ON public.food_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create function to handle new user creation with enhanced profile
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        health_conditions,
        medications,
        allergies,
        emergency_contact
    )
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email,
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        '{}'::JSONB
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS skin_assessments_user_id_idx ON skin_assessments(user_id);
CREATE INDEX IF NOT EXISTS skin_assessments_created_at_idx ON skin_assessments(created_at);
CREATE INDEX IF NOT EXISTS diabetes_assessments_user_id_idx ON diabetes_assessments(user_id);
CREATE INDEX IF NOT EXISTS cancer_assessments_user_id_idx ON cancer_assessments(user_id);
CREATE INDEX IF NOT EXISTS cardio_assessments_user_id_idx ON cardio_assessments(user_id);
CREATE INDEX IF NOT EXISTS nutrition_plans_user_id_idx ON public.nutrition_plans(user_id);
CREATE INDEX IF NOT EXISTS nutrition_plans_created_at_idx ON public.nutrition_plans(created_at);
CREATE INDEX IF NOT EXISTS food_logs_user_id_idx ON public.food_logs(user_id);
CREATE INDEX IF NOT EXISTS food_logs_created_at_idx ON public.food_logs(created_at);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skin_assessments_updated_at
    BEFORE UPDATE ON skin_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at
    BEFORE UPDATE ON public.nutrition_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_logs_updated_at
    BEFORE UPDATE ON public.food_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.nutrition_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.food_logs TO authenticated;
