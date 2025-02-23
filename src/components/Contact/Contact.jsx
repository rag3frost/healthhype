import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          ...formData,
          user_id: user?.id
        }]);

      if (error) throw error;

      setSubmitStatus({
        loading: false,
        error: null,
        success: true
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Show success message for 3 seconds
      setTimeout(() => {
        setSubmitStatus(prev => ({ ...prev, success: false }));
      }, 3000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        loading: false,
        error: 'Failed to submit form. Please try again.',
        success: false
      });
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p className="contact-intro">
        Have questions or suggestions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </p>

      <div className="contact-content">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Subject of your message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Your message"
              rows="5"
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={submitStatus.loading}
          >
            {submitStatus.loading ? 'Sending...' : 'Send Message'}
          </button>

          {submitStatus.error && (
            <div className="error-message">
              {submitStatus.error}
            </div>
          )}

          {submitStatus.success && (
            <div className="success-message">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
        </form>

        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📧</div>
            <h3>Email</h3>
            <p>support@healthhype.com</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>Phone</h3>
            <p>+91 8605822144</p>
          </div>
          
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Address</h3>
            <p>VIT Bhopal University<br />Bhopal<br />Madhya Pradesh</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;