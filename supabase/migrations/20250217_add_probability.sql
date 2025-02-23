-- Add probability column to cancer_assessments
ALTER TABLE cancer_assessments 
ADD COLUMN probability DECIMAL;
