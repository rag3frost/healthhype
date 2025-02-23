import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { FiActivity, FiSun, FiMoon, FiHeart, FiLogOut, FiUser, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab, isDarkMode, toggleTheme, session }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY <= 0) {
        setIsVisible(true);
      } else {
        setIsVisible(currentScrollY < lastScrollY);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Redirect to home after logout
      setActiveTab('home');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          className={`navbar ${isDarkMode ? 'dark' : ''} ${isVisible ? 'visible' : 'hidden'}`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="nav-content">
            <div className="nav-brand">
              <div className="logo-wrapper">
                <FiActivity className="logo-icon" size={24} />
                <FiHeart className="heart-icon" size={16} />
              </div>
              <div className="brand-text">
                <span className="logo-text">HealthHype</span>
                <span className="badge">MD</span>
              </div>
            </div>

            <div className="nav-group">
              <div className="nav-links">
                {['home', 'features', 'about', 'contact', 'profile', 'dashboard', 'documents'].map((tab) => (
                  <motion.button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>

              <div className="nav-actions">
                {session?.user && (
                  <div className="user-info">
                    <FiUser className="user-icon" />
                    <span className="user-email">{session.user.email}</span>
                  </div>
                )}

                {session?.user && (
                  <motion.button
                    className="logout-btn"
                    onClick={handleLogout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Logout"
                  >
                    <FiLogOut size={20} />
                  </motion.button>
                )}

                <motion.button 
                  className="theme-toggle" 
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

Navbar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  session: PropTypes.object
};

export default Navbar;