import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './DiabetesPredictor.css';

const DiabetesAssessment = ({ session }) => {
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    hypertension: '0',
    heart_disease: '0',
    smoking_history: '',
    bmi: '',
    HbA1c_level: '',
    blood_glucose_level: ''
  });
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveAssessment = async (risk_level) => {
    if (!session?.user?.id) {
      throw new Error('User must be logged in to save assessment');
    }

    const { error } = await supabase
      .from('diabetes_assessments')
      .insert([
        {
          user_id: session.user.id,
          gender: formData.gender,
          age: parseInt(formData.age),
          hypertension: formData.hypertension === '1',
          heart_disease: formData.heart_disease === '1',
          smoking_history: formData.smoking_history,
          bmi: parseFloat(formData.bmi),
          hba1c_level: parseFloat(formData.HbA1c_level),
          blood_glucose_level: parseInt(formData.blood_glucose_level),
          risk_level,
          recommendations: []
        }
      ]);

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Calculate risk level based on medical criteria
      const bloodGlucose = parseFloat(formData.blood_glucose_level);
      const hba1c = parseFloat(formData.HbA1c_level);
      
      let risk_level;
      if (bloodGlucose >= 200 || hba1c >= 6.5) {
        risk_level = 'high';
      } else if (bloodGlucose >= 140 || hba1c >= 5.7) {
        risk_level = 'moderate';
      } else {
        risk_level = 'low';
      }

      // Save assessment to Supabase
      await saveAssessment(risk_level);
      
      setReport({
        date: new Date().toLocaleDateString(),
        risk_level,
        metrics: {
          bmi: parseFloat(formData.bmi),
          blood_glucose: parseFloat(formData.blood_glucose_level),
          HbA1c: parseFloat(formData.HbA1c_level)
        },
        recommendations: risk_level === 'high' ? [
          "Schedule an appointment with a healthcare provider for a comprehensive diabetes evaluation",
          "Monitor blood glucose levels regularly",
          "Maintain a balanced, low-sugar diet",
          "Engage in regular physical activity",
          "Consider consulting with a diabetes educator"
        ] : risk_level === 'moderate' ? [
          "Monitor blood glucose levels",
          "Make dietary modifications",
          "Increase physical activity",
          "Schedule follow-up assessment"
        ] : [
          "Maintain healthy lifestyle habits",
          "Continue regular exercise routine",
          "Follow a balanced diet",
          "Schedule regular check-ups"
        ]
      });
    } catch (error) {
      console.error('Error processing assessment:', error);
      setError('Failed to process assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="error-message">
          <FiAlertCircle /> Please sign in to use the Diabetes Risk Assessment tool.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="model-form-container">
        <div className="form-header">
          <h2 className="text-2xl font-bold text-primary">Diabetes Risk Assessment</h2>
          <p className="text-gray-600 mt-2">Enter patient information for diabetes risk evaluation</p>
        </div>

        {error && (
          <div className="error-message mt-4">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="prediction-form mt-6">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                max="120"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hypertension">Hypertension</label>
              <select
                id="hypertension"
                name="hypertension"
                value={formData.hypertension}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="heart_disease">Heart Disease</label>
              <select
                id="heart_disease"
                name="heart_disease"
                value={formData.heart_disease}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="smoking_history">Smoking History</label>
              <select
                id="smoking_history"
                name="smoking_history"
                value={formData.smoking_history}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Smoking History</option>
                <option value="never">Never</option>
                <option value="current">Current</option>
                <option value="former">Former</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bmi">BMI</label>
              <input
                type="number"
                id="bmi"
                name="bmi"
                value={formData.bmi}
                onChange={handleInputChange}
                required
                step="0.1"
                min="10"
                max="50"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label htmlFor="HbA1c_level">HbA1c Level (%)</label>
              <input
                type="number"
                id="HbA1c_level"
                name="HbA1c_level"
                value={formData.HbA1c_level}
                onChange={handleInputChange}
                required
                step="0.1"
                min="4"
                max="15"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="form-group">
              <label htmlFor="blood_glucose_level">Blood Glucose Level (mg/dL)</label>
              <input
                type="number"
                id="blood_glucose_level"
                name="blood_glucose_level"
                value={formData.blood_glucose_level}
                onChange={handleInputChange}
                required
                min="70"
                max="300"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn mt-6"
          >
            {loading ? 'Processing...' : 'Assess Risk'}
          </button>
        </form>

        {report && (
          <div className="assessment-report mt-8">
            <h3 className="text-xl font-semibold mb-4">Assessment Report ({report.date})</h3>
            
            <div className={`risk-level ${report.risk_level}`}>
              {report.risk_level === 'high' ? (
                <FiAlertCircle />
              ) : (
                <FiCheckCircle />
              )}
              <span className="ml-2">{report.risk_level.toUpperCase()} RISK</span>
            </div>

            <div className="metrics mt-4">
              <h4 className="font-semibold mb-2">Assessment Metrics</h4>
              <ul className="space-y-2">
                <li>BMI: {report.metrics.bmi}</li>
                <li>Blood Glucose: {report.metrics.blood_glucose} mg/dL</li>
                <li>HbA1c: {report.metrics.HbA1c}%</li>
              </ul>
            </div>

            <div className="recommendations mt-4">
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1">
                {report.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiabetesAssessment;