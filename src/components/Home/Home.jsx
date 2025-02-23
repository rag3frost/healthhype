import { FiActivity, FiHeart, FiShield, FiAward, FiUsers, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { GiBrain, GiHealthNormal, GiMedicalDrip } from 'react-icons/gi';
import { MdHealthAndSafety, MdMedicalServices } from 'react-icons/md';
import { motion } from 'framer-motion';
import ChatWidget from '../ChatWidget/ChatWidget';
import './Home.css';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import Aurora from '../Aurora/Aurora';

function Home() {
  // Add scroll progress animation
  const [scrollRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Add stagger animation for features
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="home">
      {/* Add parallax background */}
      <div className="parallax-bg"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform Healthcare with<br></br>
              <motion.span 
                className="gradient-text"
                animate={{ 
                  background: [
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              > AI-Powered</motion.span> Diagnostics
            </motion.h1>
            
            {/* Add animated background shapes */}
            <div className="animated-shapes">
              <motion.div 
                className="shape shape-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div 
                className="shape shape-2"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Empower your medical practice with cutting-edge AI technology that delivers 
              <motion.span 
                className="highlight-text"
                animate={{ 
                  color: ["#3b82f6", "#2563eb", "#3b82f6"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              > 99% accurate</motion.span> diagnostics and early disease detection in real-time.
            </motion.p>

            <motion.div 
              className="cta-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button 
                className="primary-cta"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 30px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial 
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FiArrowRight />
                </motion.span>
              </motion.button>
              <motion.button 
                className="secondary-cta"
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(59, 130, 246, 0.1)"
                }}
              >
                Watch Demo
              </motion.button>
            </motion.div>
            <div className="trust-badges">
              <div className="badge">
                <FiShield /> HIPAA Compliant
              </div>
              <div className="badge">
                <FiAward /> FDA Approved
              </div>
              <div className="badge">
                <FiUsers /> 50k+ Users
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div 
              className="floating-cards"
              animate={{ 
                rotateY: [0, 10, 0],
                rotateX: [0, 5, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="stat-card card-1">
                <FiTrendingUp className="card-icon" />
                <div className="card-content">
                  <h3>99% Accuracy</h3>
                  <p>In Disease Detection</p>
                </div>
              </div>
              <div className="stat-card card-2">
                <GiBrain className="card-icon" />
                <div className="card-content">
                  <h3>24/7 AI Support</h3>
                  <p>Real-time Analysis</p>
                </div>
              </div>
              <div className="stat-card card-3">
                <GiHealthNormal className="card-icon" />
                <div className="card-content">
                  <h3>50k+ Diagnoses</h3>
                  <p>Processed Daily</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="features-section"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        ref={scrollRef}
      >
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Powerful AI Solutions for Modern Healthcare
        </motion.h2>
        <div className="features-grid">
          {[
            {
              icon: <GiHealthNormal />,
              title: "Disease Prediction",
              description: "Early detection of potential health risks using advanced ML models",
              features: ["Heart Disease Analysis", "Diabetes Risk Assessment", "Cancer Screening Support"]
            },
            {
              icon: <MdHealthAndSafety />,
              title: "Health Monitoring",
              description: "Real-time health tracking with AI-powered insights",
              features: ["Vital Signs Monitoring", "Chronic Disease Management", "Medication Tracking"]
            },
            {
              icon: <GiMedicalDrip />,
              title: "Medical Analytics",
              description: "Comprehensive health data analysis and reporting",
              features: ["Lab Results Analysis", "Treatment Response Prediction", "Health Trend Analysis"]
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
                background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul className="feature-list">
                {feature.features.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* New Testimonials Section */}
      <motion.section 
        className="testimonials-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Trusted by Healthcare Professionals
        </motion.h2>
        <div className="testimonials-grid">
          {[
            {
              quote: "HealthHype has revolutionized our diagnostic process. The AI accuracy is remarkable.",
              author: "Dr. Sarah Chen",
              role: "Chief of Cardiology",
              hospital: "Mayo Clinic",
              image: "https://randomuser.me/api/portraits/women/1.jpg"
            },
            {
              quote: "The real-time analysis capabilities have helped us save countless lives through early detection.",
              author: "Dr. James Wilson",
              role: "Oncologist",
              hospital: "Johns Hopkins",
              image: "https://randomuser.me/api/portraits/men/2.jpg"
            },
            {
              quote: "A game-changer in healthcare technology. The AI insights are incredibly accurate.",
              author: "Dr. Emily Rodriguez",
              role: "Neural Surgeon",
              hospital: "Cleveland Clinic",
              image: "https://randomuser.me/api/portraits/women/3.jpg"
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="testimonial-content">
                <img src={testimonial.image} alt={testimonial.author} className="testimonial-image" />
                <p className="testimonial-quote">{testimonial.quote}</p>
                <div className="testimonial-author">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                  <p className="hospital">{testimonial.hospital}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* New Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <motion.div
            className="stat-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Accuracy Rate</div>
          </motion.div>
          <motion.div
            className="stat-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-number">500+</div>
            <div className="stat-label">Hospitals</div>
          </motion.div>
          <motion.div
            className="stat-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-number">1M+</div>
            <div className="stat-label">Diagnoses</div>
          </motion.div>
        </div>
      </section>

      {/* New Integration Partners Section */}
      <section className="partners-section">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Seamless Integration Partners
        </motion.h2>
        <motion.div 
          className="partners-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {['Epic', 'Cerner', 'Allscripts', 'Meditech', 'NextGen', 'AthenaHealth'].map((partner, index) => (
            <motion.div
              key={index}
              className="partner-card"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.1,
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.3 }
              }}
            >
              {partner}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* New CTA Section */}
      <motion.section 
        className="bottom-cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="cta-container"
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h2>Ready to Transform Your Healthcare Practice?</h2>
          <p>Join thousands of healthcare providers using HealthHype's AI-powered diagnostics</p>
          <div className="cta-buttons">
            <motion.button
              className="primary-cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial <FiArrowRight />
            </motion.button>
            <button className="secondary-cta">Schedule Demo</button>
          </div>
        </motion.div>
      </motion.section>
      <Aurora />
      <ChatWidget />
    </div>
  );
}

export default Home; 