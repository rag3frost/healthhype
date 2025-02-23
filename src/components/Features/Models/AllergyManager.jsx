import { useState } from 'react';
import './ModelStyles.css';

function AllergyManager() {
  const [formData, setFormData] = useState({
    allergies: '',
    foodIntake: '',
    symptoms: '',
    location: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);

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
      // First, get weather data
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${formData.location}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
      );
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather data');
      const weatherData = await weatherResponse.json();

      // Get allergy analysis from Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{
            role: "system",
            content: "You are an AI allergy management assistant. Provide concise, structured advice using HTML formatting (h4, p, ul, li, strong tags). Focus on practical, actionable recommendations."
          }, {
            role: "user",
            content: `Analyze the following allergy-related data:
              Known Allergies: ${formData.allergies}
              Recent Food Intake: ${formData.foodIntake}
              Current Symptoms: ${formData.symptoms}
              Weather Conditions: ${JSON.stringify(weatherData)}
              Location: ${formData.location}`
          }],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Failed to analyze allergy data');
      
      const data = await response.json();
      setResult(data.choices[0].message.content);

      // Find nearby hospitals
      await fetchNearbyHospitals(formData.location);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyHospitals = async (location) => {
    try {
      // First get coordinates using OpenCage
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results?.length) {
        throw new Error('Location not found');
      }

      const { lat, lng } = geocodeData.results[0].geometry;

      // Then find nearby hospitals
      const hospitalsResponse = await fetch('https://api.radar.io/v1/search/places', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_RADAR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          near: [lat, lng],
          radius: 5000,
          categories: ['medical-health', 'hospital', 'medical-center'],
          limit: 10
        })
      });

      const hospitalsData = await hospitalsResponse.json();
      setHospitals(hospitalsData.places || []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  };

  return (
    <div className="model-form-container">
      <h2>AI Allergy Management Assistant</h2>
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-group">
          <label htmlFor="allergies">Known Allergies</label>
          <input
            type="text"
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="e.g., peanuts, pollen, dust"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="foodIntake">Recent Food Intake</label>
          <textarea
            id="foodIntake"
            name="foodIntake"
            value={formData.foodIntake}
            onChange={handleChange}
            rows="3"
            placeholder="List foods consumed in the last 24 hours"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Current Symptoms</label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows="3"
            placeholder="Describe any symptoms you're experiencing"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter your city"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Allergy Risks'}
        </button>
      </form>

      {loading && <div className="loading">Analyzing allergy risks...</div>}
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="analysis-result">
          <div className="analysis-content" dangerouslySetInnerHTML={{ __html: result }} />
          
          {hospitals.length > 0 && (
            <div className="nearby-hospitals">
              <h4>Nearby Healthcare Facilities:</h4>
              <div className="hospital-list">
                {hospitals.map((hospital, index) => (
                  <div key={index} className="hospital-item">
                    <h5>{hospital.name}</h5>
                    <p>{hospital.address}</p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="directions-btn"
                    >
                      Get Directions
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="disclaimer">
            <small>Note: This analysis is for informational purposes only. In case of severe allergic reactions, seek immediate medical attention.</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllergyManager; 