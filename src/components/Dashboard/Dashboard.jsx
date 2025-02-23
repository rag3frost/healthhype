import React, { useState, useEffect, useCallback } from 'react';
import { FaHeartbeat, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { MdLocalHospital } from 'react-icons/md';
import { supabase } from '../../supabaseClient';
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { format, subDays } from 'date-fns';
import './DashboardModern.css';
import { FiActivity, FiTrendingUp, FiCalendar } from 'react-icons/fi';

const Dashboard = ({ session }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthTrends, setHealthTrends] = useState({
    labels: [],
    datasets: []
  });
  const [riskDistribution, setRiskDistribution] = useState({
    labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
    }]
  });
  const [assessmentTrends, setAssessmentTrends] = useState({
    labels: [],
    datasets: []
  });
  
  const [riskMetrics, setRiskMetrics] = useState({
    labels: ['Blood Pressure', 'Blood Sugar', 'BMI', 'Heart Rate', 'Cholesterol'],
    datasets: [{
      label: 'Current Metrics',
      data: [65, 75, 80, 85, 70],
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
    }]
  });

  // Add new state for real-time health data
  const [currentHealth, setCurrentHealth] = useState({
    heartRate: 75,
    bloodPressure: '120/80',
    bloodSugar: 95,
    temperature: 98.6,
    oxygenLevel: 98
  });

  // Function to simulate real-time health data updates
  const updateHealthMetrics = useCallback(() => {
    setCurrentHealth(prev => ({
      heartRate: prev.heartRate + Math.floor(Math.random() * 3 - 1), // Vary by -1 to +1
      bloodPressure: `${120 + Math.floor(Math.random() * 5)}/${80 + Math.floor(Math.random() * 3)}`,
      bloodSugar: prev.bloodSugar + Math.floor(Math.random() * 3 - 1),
      temperature: +(prev.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1),
      oxygenLevel: Math.min(100, Math.max(95, prev.oxygenLevel + Math.floor(Math.random() * 3 - 1)))
    }));
  }, []);

  // Update health trends with new data
  const updateHealthTrends = useCallback(() => {
    setHealthTrends(prev => {
      const newData = [...prev.datasets[0].data];
      newData.shift();
      newData.push(calculateHealthScore(currentHealth));
      
      return {
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: newData
        }]
      };
    });
  }, [currentHealth]);

  // Calculate overall health score based on current metrics
  const calculateHealthScore = (metrics) => {
    const heartRateScore = calculateMetricScore(metrics.heartRate, 60, 100);
    const bpScore = calculateBPScore(metrics.bloodPressure);
    const sugarScore = calculateMetricScore(metrics.bloodSugar, 70, 130);
    const tempScore = calculateMetricScore(metrics.temperature, 97, 99);
    const oxygenScore = calculateMetricScore(metrics.oxygenLevel, 95, 100);

    return Math.round((heartRateScore + bpScore + sugarScore + tempScore + oxygenScore) / 5);
  };

  // Helper functions for score calculations
  const calculateMetricScore = (value, min, max) => {
    if (value < min) return 100 - (min - value) * 2;
    if (value > max) return 100 - (value - max) * 2;
    return 100;
  };

  const calculateBPScore = (bp) => {
    const [systolic, diastolic] = bp.split('/').map(Number);
    const systolicScore = calculateMetricScore(systolic, 90, 140);
    const diastolicScore = calculateMetricScore(diastolic, 60, 90);
    return (systolicScore + diastolicScore) / 2;
  };

  useEffect(() => {
    if (session?.user?.id) {
      // Initial data fetch
      fetchAssessments();
      generateHealthTrends();
      calculateRiskDistribution();

      // Set up intervals for real-time updates
      const healthMetricsInterval = setInterval(updateHealthMetrics, 3000); // Update every 3 seconds
      const trendsInterval = setInterval(updateHealthTrends, 5000); // Update trends every 5 seconds

      return () => {
        clearInterval(healthMetricsInterval);
        clearInterval(trendsInterval);
      };
    }
  }, [session, updateHealthMetrics, updateHealthTrends]);

  // Update risk metrics based on current health
  useEffect(() => {
    setRiskMetrics(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: [
          calculateBPScore(currentHealth.bloodPressure),
          calculateMetricScore(currentHealth.bloodSugar, 70, 130),
          85, // BMI (static for demo)
          calculateMetricScore(currentHealth.heartRate, 60, 100),
          90  // Cholesterol (static for demo)
        ]
      }]
    }));
  }, [currentHealth]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all assessments from different tables
      const [
        { data: diabetes, error: diabetesError },
        { data: cancer, error: cancerError },
        { data: cardio, error: cardioError },
        { data: skin, error: skinError }
      ] = await Promise.all([
        supabase
          .from('diabetes_assessments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('cancer_assessments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('cardio_assessments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('skin_assessments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
      ]);

      // Check for errors
      if (diabetesError) throw diabetesError;
      if (cancerError) throw cancerError;
      if (cardioError) throw cardioError;
      if (skinError) throw skinError;

      // Format assessments data
      const formattedAssessments = [
        {
          id: 'diabetes',
          type: 'Diabetes',
          data: diabetes || [],
          details: 'Blood sugar and metabolic health analysis'
        },
        {
          id: 'cancer',
          type: 'Cancer',
          data: cancer || [],
          details: 'Cancer risk factor assessment'
        },
        {
          id: 'cardio',
          type: 'Cardiovascular',
          data: cardio || [],
          details: 'Heart health and cardiovascular assessment'
        },
        {
          id: 'skin',
          type: 'Skin',
          data: skin || [],
          details: 'Skin condition analysis'
        }
      ];

      console.log('Fetched assessments:', formattedAssessments); // Debug log
      setAssessments(formattedAssessments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to fetch assessments. Please try again later.');
      setLoading(false);
    }
  };

  const generateHealthTrends = () => {
    // Generate last 7 days dates
    const dates = Array.from({ length: 7 }, (_, i) => {
      return format(subDays(new Date(), i), 'MMM dd');
    }).reverse();

    setHealthTrends({
      labels: dates,
      datasets: [
        {
          label: 'Overall Health Score',
          data: [85, 82, 88, 87, 84, 89, 90],
          borderColor: '#3b82f6',
          tension: 0.4,
          fill: false
        }
      ]
    });
  };

  const calculateRiskDistribution = () => {
    let lowCount = 0, moderateCount = 0, highCount = 0;
    
    assessments.forEach(assessment => {
      assessment.data.forEach(item => {
        switch(item.risk_level) {
          case 'low': lowCount++; break;
          case 'moderate': moderateCount++; break;
          case 'high': highCount++; break;
        }
      });
    });

    setRiskDistribution({
      labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
      datasets: [{
        data: [lowCount, moderateCount, highCount],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 1
      }]
    });
  };

  const getAssessmentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'diabetes':
        return <MdLocalHospital className="health-card-icon" />;
      case 'cardiovascular':
        return <FaHeartbeat className="health-card-icon" />;
      case 'cancer':
        return <FaChartLine className="health-card-icon" />;
      case 'skin':
        return <FaExclamationTriangle className="health-card-icon" />;
      default:
        return <MdLocalHospital className="health-card-icon" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add new chart options for dark mode
  const getChartOptions = (isDark) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#e5e7eb' : '#1e293b',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#e5e7eb' : '#1e293b',
        bodyColor: isDark ? '#e5e7eb' : '#1e293b',
        borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
      },
      animation: {
        duration: 750,
        easing: 'easeInOutQuart'
      },
      transitions: {
        active: {
          animation: {
            duration: 400
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#64748b'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#64748b'
        }
      },
      r: {
        animation: {
          duration: 500
        }
      }
    }
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <svg className="loading-spinner" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <p className="error-message">Please sign in to view your health dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Health Dashboard</h1>
            <p className="dashboard-subtitle">Track your health assessments and risk factors</p>
          </div>
          <div className="header-right">
            <div className="health-score">
              <div className="score-circle">
                <span className="score-value">87</span>
                <span className="score-label">Health Score</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-quick-stats">
        <div className="quick-stat-card health-card-interactive">
          <FiActivity className="stat-icon" />
          <div className="stat-info">
            <h3>Health Score</h3>
            <p className="stat-value">87</p>
            <span className="stat-trend positive">↑ 3%</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <FiTrendingUp className="stat-icon" />
          <div className="stat-info">
            <h3>Risk Level</h3>
            <p className="stat-value">Low</p>
            <span className="stat-trend">Stable</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <FiCalendar className="stat-icon" />
          <div className="stat-info">
            <h3>Next Check-up</h3>
            <p className="stat-value">7 days</p>
            <span className="stat-label">Scheduled</span>
          </div>
        </div>
      </div>

      <div className="dashboard-analytics">
        <div className="analytics-grid">
          <div className="chart-container trends-chart health-card-interactive">
            <h3>Health Trends</h3>
            <Line 
              data={healthTrends}
              options={getChartOptions(document.documentElement.classList.contains('dark'))}
            />
          </div>
          
          <div className="chart-container risk-metrics">
            <h3>Health Metrics Overview</h3>
            <Radar 
              data={riskMetrics}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false }
                  }
                }
              }}
            />
          </div>

          <div className="chart-container distribution-chart">
            <h3>Risk Distribution</h3>
            <Doughnut 
              data={riskDistribution}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                },
                cutout: '70%'
              }}
            />
          </div>

          <div className="chart-container assessment-history">
            <h3>Assessment History</h3>
            <Bar 
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Completed Assessments',
                  data: [12, 15, 18, 14, 20, 16],
                  backgroundColor: '#3b82f6'
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { display: false }
                  },
                  x: {
                    grid: { display: false }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="health-card health-card-interactive">
            <div className="health-card-header">
              <h2 className="health-card-title">
                {getAssessmentIcon(assessment.type)}
                {assessment.type} Assessment
              </h2>
            </div>
            <div className="health-card-content">
              {assessment.data.length > 0 ? (
                <div className="assessment-list">
                  {assessment.data.slice(0, 3).map((item, index) => (
                    <div key={index} className="assessment-item">
                      <div>
                        <div className="assessment-date">{formatDate(item.created_at)}</div>
                        <p className="text-sm text-gray-600">{assessment.details}</p>
                      </div>
                      <span className={`assessment-risk risk-${item.risk_level}`}>
                        {item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1)} Risk
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  {getAssessmentIcon(assessment.type)}
                  <p className="empty-state-text">No assessments yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;