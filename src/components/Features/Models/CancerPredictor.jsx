import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './CancerPredictor.css';

function CancerPredictor({ session }) {
  const [formData, setFormData] = useState({
    Gender: '1',
    Age: '',
    BMI: '',
    Smoking: '0',
    GeneticRisk: '0',
    PhysicalActivity: '',
    AlcoholIntake: '',
    CancerHistory: '0'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const processedData = {
        ...formData,
        Age: parseInt(formData.Age),
        BMI: parseFloat(formData.BMI)
      };

      const response = await fetch('http://127.0.0.1:5000/predict/cancer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData)
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const predictionData = await response.json();
      setResult(predictionData.prediction);

      // Save to Supabase
      if (session?.user?.id) {
        const { error } = await supabase
          .from('cancer_assessments')
          .insert([{
            user_id: session.user.id,
            gender: formData.Gender,
            age: parseInt(formData.Age),
            bmi: parseFloat(formData.BMI),
            smoking: formData.Smoking === '1',
            genetic_risk: parseInt(formData.GeneticRisk),
            physical_activity: parseFloat(formData.PhysicalActivity),
            alcohol_intake: parseFloat(formData.AlcoholIntake),
            cancer_history: formData.CancerHistory === '1',
            risk_level: predictionData.prediction === 1 ? 'high' : 'low',
            recommendations: [],
            probability: predictionData.probability,
            created_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('Error saving to Supabase:', error);
          throw error;
        }
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to process prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="model-form-container">
      <h2>Cancer Risk Prediction</h2>
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="Gender">Gender</label>
            <select
              id="Gender"
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              required
            >
              <option value="0">Female</option>
              <option value="1">Male</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="Age">Age</label>
            <input
              type="number"
              id="Age"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              required
              min="0"
              max="120"
            />
          </div>

          <div className="form-group">
            <label htmlFor="BMI">BMI</label>
            <input
              type="number"
              id="BMI"
              name="BMI"
              value={formData.BMI}
              onChange={handleChange}
              required
              step="0.01"
              min="10"
              max="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="Smoking">Smoking</label>
            <select
              id="Smoking"
              name="Smoking"
              value={formData.Smoking}
              onChange={handleChange}
              required
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="GeneticRisk">Genetic Risk</label>
            <select
              id="GeneticRisk"
              name="GeneticRisk"
              value={formData.GeneticRisk}
              onChange={handleChange}
              required
            >
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="PhysicalActivity">Physical Activity Level (0-10)</label>
            <input
              type="number"
              id="PhysicalActivity"
              name="PhysicalActivity"
              value={formData.PhysicalActivity}
              onChange={handleChange}
              required
              step="0.1"
              min="0"
              max="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="AlcoholIntake">Alcohol Intake Level (0-5)</label>
            <input
              type="number"
              id="AlcoholIntake"
              name="AlcoholIntake"
              value={formData.AlcoholIntake}
              onChange={handleChange}
              required
              step="0.1"
              min="0"
              max="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="CancerHistory">Cancer History</label>
            <select
              id="CancerHistory"
              name="CancerHistory"
              value={formData.CancerHistory}
              onChange={handleChange}
              required
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Predict Risk'}
        </button>
      </form>

      {loading && <div className="loading">Processing...</div>}
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="analysis-result">
          <div className="result-section">
            <div className="medical-report">
              <div className="report-header">
                <h3>Cancer Risk Assessment Report</h3>
                <p className="report-date">Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="report-section">
                <h4>Assessment Result</h4>
                <div className={`severity-indicator ${
                  result === 1 ? 'severity-high' : 'severity-low'
                }`}>
                  {result === 1 ? 'Warning: Potential malignant tumor detected' : 'Result: No malignant tumor detected'}
                </div>
                <p>Confidence: {(result * 100).toFixed(2)}%</p>
              </div>

              <div className="report-section">
                <h4>Input Parameters</h4>
                <ul className="parameters-list">
                  <li>Age: {formData.Age} years</li>
                  <li>BMI: {formData.BMI}</li>
                  <li>Genetic Risk: {formData.GeneticRisk}</li>
                  <li>Physical Activity: {formData.PhysicalActivity}</li>
                  <li>Smoking Status: {formData.Smoking}</li>
                  <li>Alcohol Intake: {formData.AlcoholIntake}</li>
                </ul>
              </div>

              <div className="disclaimer-section">
                <div className="disclaimer-box">
                  <p className="disclaimer-text">
                    <strong>Medical Disclaimer:</strong> This AI-generated assessment is for screening purposes only 
                    and should not be considered as a medical diagnosis. Please consult a qualified healthcare 
                    professional for proper medical evaluation and advice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CancerPredictor; 