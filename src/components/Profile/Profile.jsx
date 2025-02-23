import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FiEdit3, FiSave, FiX, FiUser, FiMail, FiPhone, FiCalendar, FiHeart, FiVideo } from 'react-icons/fi';
import './Profile.css';

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    avatar_url: '',
    health_conditions: [],
    medications: [],
    allergies: [],
    emergency_contact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          health_conditions: data.health_conditions || [],
          medications: data.medications || [],
          allergies: data.allergies || [],
          emergency_contact: data.emergency_contact || {
            name: '',
            relationship: '',
            phone: '',
            email: ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setEditing(false);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  const handleEmergencyContact = (key, value) => {
    setProfile(prev => ({
      ...prev,
      emergency_contact: {
        ...prev.emergency_contact,
        [key]: value
      }
    }));
  };

  return (
    <div className="profile-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="profile-header">
        <div className="profile-avatar">
          <FiUser size={50} color="#8e8e8e" />
        </div>
        
        <div className="profile-info">
          <div className="profile-info-header">
            <h2 className="profile-username">{profile.full_name}</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="edit-button">
                Edit Profile
              </button>
            ) : (
              <div className="button-group">
                <button onClick={updateProfile} className="save-button" disabled={loading}>
                  Save
                </button>
                <button onClick={() => setEditing(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <FiMail className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Email</span>
                <span className="stat-value" title={profile.email || 'Not set'}>
                  {profile.email || 'Not set'}
                </span>
              </div>
            </div>
            <div className="stat-item">
              <FiUser className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Full Name</span>
                <span className="stat-value" title={profile.full_name || 'Not set'}>
                  {profile.full_name || 'Not set'}
                </span>
              </div>
            </div>
            <div className="stat-item">
              <FiPhone className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Phone</span>
                <span className="stat-value" title={profile.phone || 'Not set'}>
                  {profile.phone || 'Not set'}
                </span>
              </div>
            </div>
            <div className="stat-item">
              <FiCalendar className="stat-icon" />
              <div className="stat-info">
                <span className="stat-label">Date of Birth</span>
                <span className="stat-value" title={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}>
                  {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="contact-methods">
            <button className="contact-button">
              <FiMail />
            </button>
            <button className="contact-button">
              <FiPhone />
            </button>
            <button className="contact-button">
              <FiVideo />
            </button>
          </div>
        </div>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label><FiUser /> Full Name</label>
          {editing ? (
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={e => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
          ) : (
            <p>{profile.full_name || 'Not set'}</p>
          )}
        </div>

        <div className="form-group">
          <label><FiMail /> Email</label>
          {editing ? (
            <input
              type="email"
              value={profile.email || ''}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter your email"
            />
          ) : (
            <p>{profile.email || 'Not set'}</p>
          )}
        </div>

        <div className="form-group">
          <label><FiPhone /> Phone</label>
          {editing ? (
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          ) : (
            <p>{profile.phone || 'Not set'}</p>
          )}
        </div>

        <div className="form-group">
          <label><FiCalendar /> Date of Birth</label>
          {editing ? (
            <input
              type="date"
              value={profile.date_of_birth || ''}
              onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })}
            />
          ) : (
            <p>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}</p>
          )}
        </div>

        <div className="form-group">
          <label><FiHeart /> Health Conditions</label>
          {editing ? (
            <textarea
              value={profile.health_conditions.join(', ')}
              onChange={e => handleArrayInput('health_conditions', e.target.value)}
              placeholder="e.g., Asthma, Diabetes, Hypertension"
            />
          ) : (
            <p>{profile.health_conditions.length > 0 ? profile.health_conditions.join(', ') : 'None'}</p>
          )}
        </div>

        <div className="form-group">
          <label><FiHeart /> Medications</label>
          {editing ? (
            <textarea
              value={profile.medications.join(', ')}
              onChange={e => handleArrayInput('medications', e.target.value)}
              placeholder="e.g., Aspirin, Insulin, Lisinopril"
            />
          ) : (
            <p>{profile.medications.length > 0 ? profile.medications.join(', ') : 'None'}</p>
          )}
        </div>

        <div className="form-group">
          <label><FiHeart /> Allergies</label>
          {editing ? (
            <textarea
              value={profile.allergies.join(', ')}
              onChange={e => handleArrayInput('allergies', e.target.value)}
              placeholder="e.g., Penicillin, Peanuts, Latex"
            />
          ) : (
            <p>{profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None'}</p>
          )}
        </div>

        <div className="emergency-contact">
          <h3>Emergency Contact</h3>
          <div className="contact-list">
            <div className="form-group">
              <label><FiUser /> Name</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.emergency_contact.name}
                  onChange={e => handleEmergencyContact('name', e.target.value)}
                  placeholder="Emergency contact name"
                />
              ) : (
                <p>{profile.emergency_contact.name || 'Not set'}</p>
              )}
            </div>

            <div className="form-group">
              <label>Relationship</label>
              {editing ? (
                <input
                  type="text"
                  value={profile.emergency_contact.relationship}
                  onChange={e => handleEmergencyContact('relationship', e.target.value)}
                  placeholder="Relationship to contact"
                />
              ) : (
                <p>{profile.emergency_contact.relationship || 'Not set'}</p>
              )}
            </div>

            <div className="form-group">
              <label><FiPhone /> Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={profile.emergency_contact.phone}
                  onChange={e => handleEmergencyContact('phone', e.target.value)}
                  placeholder="Emergency contact phone"
                />
              ) : (
                <p>{profile.emergency_contact.phone || 'Not set'}</p>
              )}
            </div>

            <div className="form-group">
              <label><FiMail /> Email</label>
              {editing ? (
                <input
                  type="email"
                  value={profile.emergency_contact.email}
                  onChange={e => handleEmergencyContact('email', e.target.value)}
                  placeholder="Emergency contact email"
                />
              ) : (
                <p>{profile.emergency_contact.email || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}