import { useState } from 'react';
import './FitnessForm.css';

const FitnessForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'sedentary',
    goal: 'weight-loss'
  });
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: 'system',
            content: 'You are a professional fitness coach and nutritionist. Provide personalized fitness and nutrition plans in JSON format only.'
          }, {
            role: 'user',
            content: `Create a personalized fitness and nutrition plan for:
              Age: ${formData.age}
              Gender: ${formData.gender}
              Weight: ${formData.weight}kg
              Height: ${formData.height}cm
              Activity Level: ${formData.activityLevel}
              Goal: ${formData.goal}`
          }],
          max_tokens: 1500,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('Failed to generate plan');
      
      const result = await response.json();
      const planData = JSON.parse(result.choices[0].message.content.trim());
      setPlan(planData);
    } catch (err) {
      setError('Failed to generate fitness plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fitness-goal-section">
      <h3>Get Your Personalized Fitness Plan</h3>
      <form onSubmit={handleSubmit} className="animated-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
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
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="weight">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="activityLevel">Activity Level</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly Active</option>
            <option value="moderate">Moderately Active</option>
            <option value="very">Very Active</option>
            <option value="extra">Extra Active</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="goal">Your Goal</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            required
          >
            <option value="weight-loss">Weight Loss</option>
            <option value="muscle-gain">Build Muscle</option>
            <option value="maintenance">Maintain Weight</option>
            <option value="endurance">Improve Endurance</option>
          </select>
        </div>

        <button type="submit" className="gradient-btn" disabled={loading}>
          {loading ? 'Generating...' : 'Generate My Plan'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      
      {plan && (
        <div className="fitness-plan-container">
          <div className="plan-header">
            <h3>Your Personalized Fitness Plan</h3>
            <div className="daily-target">
              <div className="target-circle">
                <span className="target-number">{plan.dailyCalories}</span>
                <span className="target-label">Daily Calories</span>
              </div>
            </div>
          </div>

          <div className="macro-distribution">
            <h4>Macro Split</h4>
            <div className="macro-bars">
              {Object.entries(plan.macroSplit).map(([macro, value]) => (
                <div 
                  key={macro}
                  className={`macro-bar ${macro}`}
                  style={{ width: `${value}%` }}
                >
                  <span>{macro.charAt(0).toUpperCase() + macro.slice(1)} {value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="plan-sections">
            <div className="plan-section workout">
              <h4>Workout Plan</h4>
              <div dangerouslySetInnerHTML={{ __html: plan.workoutPlan }} />
            </div>
            
            <div className="plan-section meals">
              <h4>Meal Plan</h4>
              <div dangerouslySetInnerHTML={{ __html: plan.mealPlan }} />
            </div>
          </div>

          <div className="tips-section">
            <h4>Pro Tips</h4>
            <ul className="tips-list">
              {plan.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessForm; 