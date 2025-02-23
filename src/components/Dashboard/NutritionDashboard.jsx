import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FiPieChart, FiCalendar, FiList } from 'react-icons/fi';
import './Dashboard.css';

const NutritionDashboard = ({ session }) => {
  const [nutritionData, setNutritionData] = useState({
    currentPlan: null,
    recentLogs: [],
    summary: {
      dailyAverage: 0,
      weeklyTotal: 0,
      macroAverages: { protein: 0, carbs: 0, fats: 0 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNutritionData();
    }
  }, [session]);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest nutrition plan
      const { data: plans, error: planError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (planError) throw planError;

      // Fetch recent food logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: logsData, error: logsError } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Calculate summary statistics
      const summary = calculateSummary(logsData || []);

      setNutritionData({
        currentPlan: plans?.[0] || null,
        recentLogs: logsData || [],
        summary
      });
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      setError('Failed to load nutrition data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (logs) => {
    if (!logs || logs.length === 0) {
      return {
        dailyAverage: 0,
        weeklyTotal: 0,
        macroAverages: { protein: 0, carbs: 0, fats: 0 }
      };
    }

    const totalCalories = logs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
    const totalProtein = logs.reduce((sum, log) => sum + (log.protein_grams || 0), 0);
    const totalCarbs = logs.reduce((sum, log) => sum + (log.carbs_grams || 0), 0);
    const totalFats = logs.reduce((sum, log) => sum + (log.fats_grams || 0), 0);

    return {
      dailyAverage: Math.round(totalCalories / 7),
      weeklyTotal: totalCalories,
      macroAverages: {
        protein: Math.round(totalProtein / logs.length),
        carbs: Math.round(totalCarbs / logs.length),
        fats: Math.round(totalFats / logs.length)
      }
    };
  };

  if (loading) {
    return <div className="loading">Loading nutrition data...</div>;
  }

  return (
    <div className="nutrition-dashboard">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="dashboard-section">
            <h3><FiPieChart /> Current Nutrition Plan</h3>
            {nutritionData.currentPlan ? (
              <div className="plan-details">
                <div className="stat-box">
                  <h4>Daily Target</h4>
                  <p>{nutritionData.currentPlan.daily_calories} calories</p>
                </div>
                <div className="stat-box">
                  <h4>Macro Split</h4>
                  <p>Protein: {nutritionData.currentPlan.protein_percentage}%</p>
                  <p>Carbs: {nutritionData.currentPlan.carbs_percentage}%</p>
                  <p>Fats: {nutritionData.currentPlan.fats_percentage}%</p>
                </div>
                {nutritionData.currentPlan.meal_plan?.html && (
                  <div className="meal-plan" dangerouslySetInnerHTML={{ __html: nutritionData.currentPlan.meal_plan.html }} />
                )}
                {nutritionData.currentPlan.workout_plan?.html && (
                  <div className="workout-plan" dangerouslySetInnerHTML={{ __html: nutritionData.currentPlan.workout_plan.html }} />
                )}
              </div>
            ) : (
              <p>No nutrition plan found. Create one in the Calorie Tracker.</p>
            )}
          </div>

          <div className="dashboard-section">
            <h3><FiCalendar /> Weekly Summary</h3>
            <div className="summary-stats">
              <div className="stat-box">
                <h4>Daily Average</h4>
                <p>{nutritionData.summary.dailyAverage} calories</p>
              </div>
              <div className="stat-box">
                <h4>Weekly Total</h4>
                <p>{nutritionData.summary.weeklyTotal} calories</p>
              </div>
              <div className="stat-box">
                <h4>Macro Averages</h4>
                <p>Protein: {nutritionData.summary.macroAverages.protein}g</p>
                <p>Carbs: {nutritionData.summary.macroAverages.carbs}g</p>
                <p>Fats: {nutritionData.summary.macroAverages.fats}g</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h3><FiList /> Recent Food Logs</h3>
            <div className="food-logs">
              {nutritionData.recentLogs.length > 0 ? (
                nutritionData.recentLogs.map(log => (
                  <div key={log.id} className="food-log-entry">
                    <div className="log-header">
                      <h4>{log.meal_type}</h4>
                      <span>{new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="log-details">
                      <p>{log.total_calories} calories</p>
                      <p>P: {log.protein_grams}g | C: {log.carbs_grams}g | F: {log.fats_grams}g</p>
                    </div>
                    {log.image_url && (
                      <img src={log.image_url} alt="Food" className="food-image" />
                    )}
                    {log.notes && <p className="notes">{log.notes}</p>}
                  </div>
                ))
              ) : (
                <p>No recent food logs found. Start logging your meals in the Calorie Tracker.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NutritionDashboard;
