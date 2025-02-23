-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indices for better query performance
CREATE INDEX idx_diabetes_assessments_user_id ON diabetes_assessments(user_id);
CREATE INDEX idx_cancer_assessments_user_id ON cancer_assessments(user_id);
CREATE INDEX idx_cardio_assessments_user_id ON cardio_assessments(user_id);
CREATE INDEX idx_skin_assessments_user_id ON skin_assessments(user_id);
CREATE INDEX idx_nutrition_tracking_user_id ON nutrition_tracking(user_id);

-- Add check constraints for data validation
ALTER TABLE profiles
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE diabetes_assessments
ADD CONSTRAINT check_hba1c_range
CHECK (HbA1c_level BETWEEN 3.0 AND 20.0),
ADD CONSTRAINT check_blood_glucose_range
CHECK (blood_glucose_level BETWEEN 0 AND 1000);

ALTER TABLE cardio_assessments
ADD CONSTRAINT check_height_range
CHECK (height BETWEEN 100 AND 250),
ADD CONSTRAINT check_weight_range
CHECK (weight BETWEEN 30 AND 300),
ADD CONSTRAINT check_blood_pressure
CHECK (ap_hi >= ap_lo);

-- Add enum types for better data consistency
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE risk_level_type AS ENUM ('low', 'moderate', 'high', 'very_high');
CREATE TYPE smoking_history_type AS ENUM ('never', 'former', 'current', 'not_specified');

-- Add function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg DECIMAL, height_cm INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND((weight_kg / POWER(height_cm::decimal / 100, 2))::numeric, 2);
END;
$$ LANGUAGE plpgsql;
