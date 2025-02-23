import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import './CardioPredictor.css';

function CardioPredictor({ session }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: '1',
    height: '',
    weight: '',
    ap_hi: '',
    ap_lo: '',
    cholesterol: '1',
    gluc: '1',
    smoke: '0',
    alco: '0',
    active: '1'
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
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        ap_hi: parseInt(formData.ap_hi),
        ap_lo: parseInt(formData.ap_lo)
      };

      const response = await fetch('http://127.0.0.1:5000/predict/cardio', {
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
          .from('cardio_assessments')
          .insert([{
            user_id: session.user.id,
            age: parseInt(formData.age),
            gender: formData.gender === '1' ? 'Male' : 'Female',
            height: parseInt(formData.height),
            weight: parseFloat(formData.weight),
            ap_hi: parseInt(formData.ap_hi),
            ap_lo: parseInt(formData.ap_lo),
            cholesterol: parseInt(formData.cholesterol),
            gluc: parseInt(formData.gluc),
            smoke: formData.smoke === '1',
            alco: formData.alco === '1',
            active: formData.active === '1',
            risk_level: predictionData.prediction === 1 ? 'high' : 'low',
            recommendations: predictionData.recommendations || [],
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
      <h2>Cardiovascular Disease Risk Assessment</h2>
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age (years)</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
              max="120"
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="1">Female</option>
              <option value="2">Male</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              min="100"
              max="250"
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="30"
              max="300"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ap_hi">Systolic Blood Pressure</label>
            <input
              type="number"
              id="ap_hi"
              name="ap_hi"
              value={formData.ap_hi}
              onChange={handleChange}
              required
              min="80"
              max="220"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ap_lo">Diastolic Blood Pressure</label>
            <input
              type="number"
              id="ap_lo"
              name="ap_lo"
              value={formData.ap_lo}
              onChange={handleChange}
              required
              min="40"
              max="140"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cholesterol">Cholesterol Level</label>
            <select
              id="cholesterol"
              name="cholesterol"
              value={formData.cholesterol}
              onChange={handleChange}
              required
            >
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="gluc">Glucose Level</label>
            <select
              id="gluc"
              name="gluc"
              value={formData.gluc}
              onChange={handleChange}
              required
            >
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="smoke">Smoking</label>
            <select
              id="smoke"
              name="smoke"
              value={formData.smoke}
              onChange={handleChange}
              required
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="alco">Alcohol Intake</label>
            <select
              id="alco"
              name="alco"
              value={formData.alco}
              onChange={handleChange}
              required
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="active">Physical Activity</label>
            <select
              id="active"
              name="active"
              value={formData.active}
              onChange={handleChange}
              required
            >
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Assess Cardiovascular Risk'}
        </button>
      </form>

      {loading && <div className="loading">Processing...</div>}
      {error && <div className="error">{error}</div>}
      {result !== null && (
        <div className={`result ${result === 1 ? 'warning' : 'success'}`}>
          {result === 1 ? 
            'Warning: High risk of cardiovascular disease detected' : 
            'Result: Low risk of cardiovascular disease detected'}
        </div>
      )}
    </div>
  );
}

export default CardioPredictor; 