import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiShield, FiAward, FiUsers, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { GiBrain, GiHealthNormal, GiMedicalDrip, GiMicroscope } from 'react-icons/gi';
import { MdHealthAndSafety, MdMedicalServices, MdTimeline, MdPrecisionManufacturing } from 'react-icons/md';
import { RiHospitalLine, RiMentalHealthLine } from 'react-icons/ri';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './About.css';

function About() {
  const impactData = [
    { name: '2023 Q1', accuracy: 92 },
    { name: '2023 Q2', accuracy: 94 },
    { name: '2023 Q3', accuracy: 96 },
    { name: '2023 Q4', accuracy: 97 },
    { name: '2024 Q1', accuracy: 99 },
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <motion.section 
        className="about-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Pioneering AI-Driven
            <span className="accent-text"> Healthcare Innovation</span>
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Transforming medical diagnostics through advanced artificial intelligence
            and machine learning technologies
          </motion.p>
        </div>
        
        <div className="impact-stats">
          <motion.div 
            className="stat-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={impactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[90, 100]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="var(--medical-accent-teal)" />
              </BarChart>
            </ResponsiveContainer>
            <p className="chart-label">Diagnostic Accuracy Progression (%)</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <motion.section 
        className="mission-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="section-header">
          <h2>Our Mission & Vision</h2>
          <div className="section-underline" />
        </div>
        
        <div className="mission-content">
          <div className="mission-text">
            <p className="mission-statement">
              "To revolutionize healthcare through AI-powered diagnostics, making advanced medical insights 
              accessible, accurate, and actionable for healthcare providers worldwide."
            </p>
            <div className="vision-points">
              {[
                {
                  icon: <FiTarget />,
                  title: "Precision Medicine",
                  description: "Delivering personalized diagnostic insights through advanced AI algorithms"
                },
                {
                  icon: <MdPrecisionManufacturing />,
                  title: "Innovation Focus",
                  description: "Continuously advancing our AI models through cutting-edge research"
                },
                {
                  icon: <RiHospitalLine />,
                  title: "Global Impact",
                  description: "Expanding healthcare access through scalable AI solutions"
                }
              ].map((point, index) => (
                <motion.div 
                  key={index}
                  className="vision-point"
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="point-icon">{point.icon}</div>
                  <div className="point-content">
                    <h3>{point.title}</h3>
                    <p>{point.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Expertise Showcase */}
      <motion.section 
        className="expertise-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="section-header">
          <h2>Our Expertise</h2>
          <div className="section-underline" />
        </div>

        <div className="expertise-grid">
          {[
            {
              icon: <GiMicroscope />,
              title: "Diagnostic AI",
              description: "State-of-the-art machine learning models for medical image analysis",
              accuracy: "99.2%",
              details: [
                "Deep learning image recognition",
                "Real-time diagnostic assistance",
                "Multi-modal data analysis"
              ]
            },
            {
              icon: <RiMentalHealthLine />,
              title: "Clinical Decision Support",
              description: "AI-powered insights for informed medical decisions",
              accuracy: "97.8%",
              details: [
                "Evidence-based recommendations",
                "Risk assessment modeling",
                "Treatment outcome prediction"
              ]
            },
            {
              icon: <GiBrain />,
              title: "Research & Development",
              description: "Advancing healthcare through continuous innovation",
              publications: "50+",
              details: [
                "Peer-reviewed research",
                "Clinical trials",
                "Industry partnerships"
              ]
            }
          ].map((expertise, index) => (
            <motion.div 
              key={index}
              className="expertise-card"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="expertise-icon">{expertise.icon}</div>
              <h3>{expertise.title}</h3>
              <p>{expertise.description}</p>
              {expertise.accuracy && (
                <div className="accuracy-badge">
                  Accuracy: {expertise.accuracy}
                </div>
              )}
              <ul className="expertise-details">
                {expertise.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Rest of the sections... */}
    </div>
  );
}

export default About; 