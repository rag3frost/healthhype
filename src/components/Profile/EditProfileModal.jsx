import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './EditProfileModal.css';

// Helper functions
const formatLabel = (key) => {
  return key
    .split(/(?=[A-Z])|_/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getInputType = (key) => {
  const typeMap = {
    email: 'email',
    password: 'password',
    date_of_birth: 'date',
    phone: 'tel',
    avatar_url: 'url'
  };
  return typeMap[key] || 'text';
};

const EditProfileModal = ({ section, data, onSave, onClose }) => {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (key, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (key.includes('.')) {
        const [section, field] = key.split('.');
        newData[section] = { ...newData[section], [field]: value };
      } else {
        newData[key] = value;
      }
      return newData;
    });
  };

  const renderFormFields = () => {
    switch (section) {
      case 'basic':
        return (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="form-input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>
          </>
        );

      case 'medical':
        return (
          <>
            <div className="form-group">
              <label>Blood Type</label>
              <select
                value={formData.medical_info?.blood_type || ''}
                onChange={(e) => handleInputChange('medical_info.blood_type', e.target.value)}
                className="form-input"
              >
                <option value="">Select Blood Type</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Allergies (one per line)</label>
              <textarea
                value={formData.medical_info?.allergies?.join('\n') || ''}
                onChange={(e) => handleInputChange('medical_info.allergies', e.target.value.split('\n').filter(Boolean))}
                className="form-input"
                placeholder="Enter allergies (one per line)"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Chronic Conditions (one per line)</label>
              <textarea
                value={formData.medical_info?.chronic_conditions?.join('\n') || ''}
                onChange={(e) => handleInputChange('medical_info.chronic_conditions', e.target.value.split('\n').filter(Boolean))}
                className="form-input"
                placeholder="Enter chronic conditions (one per line)"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Current Medications (one per line)</label>
              <textarea
                value={formData.medical_info?.current_medications?.join('\n') || ''}
                onChange={(e) => handleInputChange('medical_info.current_medications', e.target.value.split('\n').filter(Boolean))}
                className="form-input"
                placeholder="Enter current medications (one per line)"
                rows={4}
              />
            </div>
          </>
        );

      case 'emergency':
        return (
          <>
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input
                type="text"
                value={formData.emergency_contact?.name || ''}
                onChange={(e) => handleInputChange('emergency_contact.name', e.target.value)}
                className="form-input"
                placeholder="Enter emergency contact name"
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                value={formData.emergency_contact?.relationship || ''}
                onChange={(e) => handleInputChange('emergency_contact.relationship', e.target.value)}
                className="form-input"
                placeholder="Enter relationship"
              />
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                value={formData.emergency_contact?.phone || ''}
                onChange={(e) => handleInputChange('emergency_contact.phone', e.target.value)}
                className="form-input"
                placeholder="Enter emergency contact phone"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="modal-header">
            <h2>Edit {section.charAt(0).toUpperCase() + section.slice(1)} Information</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            {renderFormFields()}
            <div className="modal-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditProfileModal; 