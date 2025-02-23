import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, 
  FiHeart, 
  FiShield, 
  FiSun, 
  FiPieChart, 
  FiAlertCircle 
} from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';
import { supabase } from '../../supabaseClient';
import CancerPredictor from './Models/CancerPredictor';
import DiabetesPredictor from './Models/DiabetesPredictor';
import CardioPredictor from './Models/CardioPredictor';
import SkinDisease from './Models/SkinDisease';
import AllergyManager from './Models/AllergyManager';
import MentalHealth from './Models/MentalHealth';
import CalorieTracker from './Models/CalorieTracker';
import './Features.css';

const modelInfo = [
  {
    id: 'cancer',
    label: 'Cancer Prediction',
    icon: <FiActivity />,
    description: 'Advanced cancer risk assessment using machine learning'
  },
  {
    id: 'diabetes',
    label: 'Diabetes Analysis',
    icon: <FiPieChart />,
    description: 'Comprehensive diabetes risk evaluation'
  },
  {
    id: 'cardio',
    label: 'Heart Health',
    icon: <FiHeart />,
    description: 'Cardiovascular disease risk prediction'
  },
  {
    id: 'skin',
    label: 'Skin Analysis',
    icon: <FiSun />,
    description: 'AI-powered skin condition detection'
  },
  {
    id: 'allergy',
    label: 'Allergy Care',
    icon: <FiAlertCircle />,
    description: 'Personalized allergy management system'
  },
  {
    id: 'mental',
    label: 'Mental Health',
    icon: <GiBrain />,
    description: '24/7 mental health support and monitoring'
  },
  {
    id: 'calories',
    label: 'Calorie Tracker',
    icon: <FiActivity />,
    description: 'AI-powered nutrition and calorie tracking'
  }
];

function Features({ session }) {
  const [activeModel, setActiveModel] = useState('cancer');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Features component session:', session); // Debug session
    if (session?.user) {
      setUser(session.user);
    }
  }, [session]);

  // Debug render
  console.log('Rendering Features with session:', session?.user?.id);
  console.log('Current active model:', activeModel);

  return (
    <div className="features-container">
      {!session?.user ? (
        <div className="auth-message">
          <h3>Please log in to access health analysis features</h3>
        </div>
      ) : (
        <>
          <motion.div 
            className="features-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>AI-Powered Health Analysis</h2>
            <p>Select a diagnostic tool to begin your health assessment</p>
          </motion.div>

          <div className="model-navigation">
            <div className="model-tabs">
              {modelInfo.map((model) => (
                <motion.button
                  key={model.id}
                  className={`model-tab ${activeModel === model.id ? 'active' : ''}`}
                  onClick={() => setActiveModel(model.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="tab-icon">{model.icon}</span>
                  <div className="tab-content">
                    <span className="tab-label">{model.label}</span>
                    <span className="tab-description">{model.description}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div 
            className="model-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModel}
                className="model-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeModel === 'cancer' && (
                  <motion.div
                    key="cancer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CancerPredictor session={session} />
                  </motion.div>
                )}
                {activeModel === 'diabetes' && (
                  <motion.div
                    key="diabetes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DiabetesPredictor session={session} />
                  </motion.div>
                )}
                {activeModel === 'cardio' && (
                  <motion.div
                    key="cardio"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardioPredictor session={session} />
                  </motion.div>
                )}
                {activeModel === 'skin' && (
                  <motion.div
                    key="skin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SkinDisease session={session} />
                  </motion.div>
                )}
                {activeModel === 'allergy' && (
                  <motion.div
                    key="allergy"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AllergyManager session={session} />
                  </motion.div>
                )}
                {activeModel === 'mental' && (
                  <motion.div
                    key="mental"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MentalHealth session={session} />
                  </motion.div>
                )}
                {activeModel === 'calories' && (
                  <motion.div
                    key="calories"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CalorieTracker session={session} />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default Features;