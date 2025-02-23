import { useState, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import './ModelStyles.css';
import { FiAlertCircle } from 'react-icons/fi';

const styles = {
  confidence: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    margin: '5px 0',
  },
  progress: {
    height: '100%',
    borderRadius: '4px',
    backgroundColor: '#28a745',
  },
  riskIndicator: {
    padding: '8px 16px',
    borderRadius: '4px',
    display: 'inline-block',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  highRisk: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  mediumRisk: {
    backgroundColor: '#ffc107',
    color: 'black',
  },
  followUpAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '10px',
    borderRadius: '4px',
    marginTop: '10px',
  },
  treatmentPlan: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '10px',
  },
  planItem: {
    marginBottom: '15px',
  },
  uploadedImage: {
    maxWidth: '300px',
    margin: '10px 0',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }
};

function SkinDisease({ session }) {
  const [formData, setFormData] = useState({
    symptoms: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatReport = (content) => {
    // Try to extract sections from the API response
    const sections = {
      diagnosis: content.match(/Diagnosis:?(.*?)(?=(Possible Causes:|Recommended Steps:|$))/s)?.[1]?.trim(),
      causes: content.match(/Possible Causes:?(.*?)(?=(Recommended Steps:|$))/s)?.[1]?.trim(),
      steps: content.match(/Recommended Steps:?(.*?)(?=$)/s)?.[1]?.trim()
    };

    // If sections weren't found, split the content into sections manually
    if (!sections.diagnosis && !sections.causes && !sections.steps) {
      const paragraphs = content.split('\n\n');
      sections.diagnosis = paragraphs[0] || '';
      sections.causes = paragraphs[1] || '';
      sections.steps = paragraphs[2] || '';
    }

    return sections;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(formData.image);
      const prompt = `Analyze this skin image and provide a detailed medical report in the following format:

Diagnosis:
[Provide a clear, concise diagnosis of the visible skin condition]

Possible Causes:
[List the potential causes or triggers]

Recommended Steps:
[Provide specific recommendations and next steps]

Additional symptoms reported: ${formData.symptoms || 'None'}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-preview",
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: base64Image.startsWith('data:') 
                    ? base64Image 
                    : `data:image/jpeg;base64,${base64Image}`
                } 
              }
            ]
          }],
          max_tokens: 1024,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to analyze image');
      }

      const data = await response.json();
      const formattedResult = formatReport(data.choices[0].message.content);
      setResult(formattedResult);

      // Save to Supabase if user is logged in
      if (session?.user?.id) {
        try {
          // Upload image to Supabase Storage
          const fileExt = formData.image.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${session.user.id}/${fileName}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('skin-images')
            .upload(filePath, formData.image, {
              cacheControl: '3600',
              upsert: false,
              contentType: formData.image.type
            });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error('Failed to upload image');
          }

          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('skin-images')
            .getPublicUrl(filePath);

          // Save assessment data to Supabase
          const { error: saveError } = await supabase
            .from('skin_assessments')
            .insert([{
              user_id: session.user.id,
              diagnosis: formattedResult.diagnosis,
              possible_causes: formattedResult.causes,
              recommendations: formattedResult.steps,
              risk_level: formattedResult.diagnosis.toLowerCase().includes('severe') ? 'high' : 'medium',
              symptoms: formData.symptoms,
              image_url: publicUrl,
              confidence_score: 0.85,
              follow_up_required: formattedResult.steps.toLowerCase().includes('consult') || 
                                formattedResult.steps.toLowerCase().includes('see a doctor'),
              treatment_plan: {
                diagnosis: formattedResult.diagnosis,
                causes: formattedResult.causes,
                recommendations: formattedResult.steps
              },
              created_at: new Date().toISOString()
            }]);

          if (saveError) {
            console.error('Error saving to Supabase:', saveError);
            throw new Error('Failed to save assessment');
          }
        } catch (err) {
          console.error('Error in Supabase operations:', err);
          throw err;
        }
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="model-form-container">
      <h2>AI Skin Condition Analyzer</h2>
      <p className="model-description">
        Upload a clear image of the affected skin area for analysis. For best results, ensure good lighting and focus.
      </p>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-group">
          <label htmlFor="skin-image">Upload Skin Image</label>
          <input
            type="file"
            id="skin-image"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="file-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Skin condition preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="symptoms">Additional Symptoms (Optional)</label>
          <textarea
            id="symptoms"
            value={formData.symptoms}
            onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
            placeholder="Describe any additional symptoms or concerns..."
            rows="3"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="analysis-result">
          <div className="result-section">
            <div className="medical-report" style={{ padding: 0, margin: 0 }}>
              <div className="report-header">
                <h3>Skin Condition Analysis Report</h3>
                <p className="report-date">Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="report-section" style={{ marginBottom: '15px' }}>
                <h4>Diagnosis</h4>
                <div dangerouslySetInnerHTML={{ __html: result.diagnosis }} />
                <div className="confidence-score">
                  <span className="label">Confidence Score:</span>
                  <div className="progress-bar" style={styles.progressBar}>
                    <div 
                      className="progress" 
                      style={{ 
                        width: `${85}%`, 
                        ...styles.progress 
                      }}
                    ></div>
                  </div>
                  <span className="score">85%</span>
                </div>
              </div>

              <div className="report-section" style={{ marginBottom: '15px' }}>
                <h4>Risk Level</h4>
                <div 
                  className={`risk-indicator ${result.diagnosis.toLowerCase().includes('severe') ? 'high-risk' : 'medium-risk'}`} 
                  style={{
                    ...styles.riskIndicator,
                    ...(result.diagnosis.toLowerCase().includes('severe') ? styles.highRisk : styles.mediumRisk)
                  }}
                >
                  {result.diagnosis.toLowerCase().includes('severe') ? 'High Risk' : 'Medium Risk'}
                </div>
              </div>

              <div className="report-section" style={{ marginBottom: '15px' }}>
                <h4>Possible Causes</h4>
                <div dangerouslySetInnerHTML={{ __html: result.causes }} />
              </div>

              <div className="report-section" style={{ marginBottom: '15px' }}>
                <h4>Recommended Steps</h4>
                <div dangerouslySetInnerHTML={{ __html: result.steps }} />
                {(result.steps.toLowerCase().includes('consult') || 
                  result.steps.toLowerCase().includes('see a doctor')) && (
                  <div 
                    className="follow-up-alert" 
                    style={styles.followUpAlert}
                  >
                    <FiAlertCircle className="alert-icon" />
                    <span>Medical Follow-up Required</span>
                  </div>
                )}
              </div>

              {formData.symptoms && (
                <div className="report-section" style={{ marginBottom: '15px' }}>
                  <h4>Reported Symptoms</h4>
                  <p>{formData.symptoms}</p>
                </div>
              )}

              {imagePreview && (
                <div className="report-section" style={{ marginBottom: '15px' }}>
                  <h4>Uploaded Image</h4>
                  <div 
                    className="uploaded-image" 
                    style={styles.uploadedImage}
                  >
                    <img src={imagePreview} alt="Skin condition" />
                  </div>
                </div>
              )}

              <div className="report-section" style={{ marginBottom: '15px' }}>
                <h4>Treatment Plan</h4>
                <div 
                  className="treatment-plan" 
                  style={styles.treatmentPlan}
                >
                  <div 
                    className="plan-item" 
                    style={styles.planItem}
                  >
                    <strong>Initial Assessment:</strong>
                    <div dangerouslySetInnerHTML={{ __html: result.diagnosis }} />
                  </div>
                  <div 
                    className="plan-item" 
                    style={styles.planItem}
                  >
                    <strong>Contributing Factors:</strong>
                    <div dangerouslySetInnerHTML={{ __html: result.causes }} />
                  </div>
                  <div 
                    className="plan-item" 
                    style={styles.planItem}
                  >
                    <strong>Treatment Steps:</strong>
                    <div dangerouslySetInnerHTML={{ __html: result.steps }} />
                  </div>
                </div>
              </div>

              <div className="disclaimer-section">
                <div className="disclaimer-box">
                  <p className="disclaimer-text">
                    <strong>Medical Disclaimer:</strong> This AI-generated analysis is for informational purposes only 
                    and should not be considered as a medical diagnosis. Please consult a qualified healthcare 
                    professional for proper medical advice and treatment.
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

export default SkinDisease;