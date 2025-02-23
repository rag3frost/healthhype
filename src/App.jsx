import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Features from './components/Features/Features';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import Aurora from './components/Aurora/Aurora';
import Auth from './components/Auth/Auth';
import Profile from './components/Profile/Profile';
import Dashboard from './components/Dashboard/Dashboard';
import Documents from './components/Documents/Documents';
import './App.css';
import './styles/darkMode.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <Aurora
        colorStops={isDarkMode ? [
          "#1e293b",  // Dark blue-gray
          "#3b82f6",  // Bright blue
          "#1e293b"   // Dark blue-gray
        ] : [
          "#e0f2fe",  // Light blue
          "#bfdbfe",  // Lighter blue
          "#dbeafe"   // Sky blue
        ]}
        speed={0.3}
        amplitude={1.5}
      />
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        session={session}
      />
      <main className={`main-content ${isDarkMode ? 'dark' : ''}`}>
        <div className="content-wrapper">
          {activeTab === 'home' && <Home />}
          {activeTab === 'features' && <Features session={session} />}
          {activeTab === 'about' && <About />}
          {activeTab === 'contact' && <Contact />}
          {activeTab === 'profile' && <Profile session={session} />}
          {activeTab === 'dashboard' && <Dashboard session={session} />}
          {activeTab === 'documents' && <Documents />}
        </div>
      </main>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App; 