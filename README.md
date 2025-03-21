# HealthHype - Medical Prediction System

HealthHype is an advanced healthcare prediction platform that leverages AI and machine learning to provide early disease detection, health monitoring, and personalized wellness guidance.

## 🌟 Features

### Disease Prediction Models
- **Diabetes Prediction**: Early detection of diabetes risk using multiple health parameters
- **Cancer Risk Assessment**: Advanced cancer risk evaluation using genetic and lifestyle factors
- **Cardiovascular Disease Prediction**: Heart health risk assessment using vital signs and health metrics
- **Skin Disease Analysis**: AI-powered skin condition detection and analysis using image processing

### Additional Features
- **Allergy Management**: Personalized allergy tracking with environmental monitoring
- **Mental Health Support**: AI companion for emotional support
- **Calorie Tracking**: Smart nutrition monitoring and meal planning
- **Healthcare Locator**: Find nearby healthcare facilities

## 🛠 Tech Stack

### Frontend
- React + Vite
- Framer Motion for animations
- Supabase for authentication and data storage
- Axios for API requests
- React Router for navigation
- React Icons for UI elements

### Backend
- Flask REST API
- scikit-learn for ML models
- pandas for data processing
- joblib for model serialization
- Flask-CORS for cross-origin support

### Database
- Supabase (PostgreSQL)
- Row Level Security (RLS) for data protection
- Complex SQL schema with multiple related tables

### ML Models
- Random Forest Classifiers
- StandardScaler for feature normalization
- Label Encoding for categorical variables
- Model persistence using joblib

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Supabase account
- OpenWeather API key (for allergy tracking)
- Groq API key (for AI features)

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/healthhype.git
cd healthhype
```

2. **Set up the backend**
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the models
python train_models.py

# Start the Flask server
python app.py
```

3. **Set up the frontend**
```bash
cd medipredict-react
npm install
npm run dev
```

4. **Environment Variables**

Create a `.env` file in the frontend directory:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_GROQ_API_KEY=your_groq_key
```

Create a `.env` file in the backend directory:
```
FATSECRET_CLIENT_ID=your_fatsecret_id
FATSECRET_CLIENT_SECRET=your_fatsecret_secret
```

## 🗄️ Database Setup

1. Run the Supabase migrations in order:
```bash
supabase db reset
```

2. The migrations will create:
- User profiles
- Assessment tables for each disease type
- Document verification system
- Contact form submissions
- Nutrition tracking

## 🔒 Security Features

- Row Level Security (RLS) policies for data protection
- Document verification using blockchain-like hashing
- Secure file storage with Supabase
- JWT authentication
- API request validation

## 📱 Features in Detail

### Disease Prediction
- Input validation and sanitization
- Real-time risk assessment
- Detailed medical reports
- Historical tracking
- Recommendation generation

### Document Management
- Secure document upload
- Blockchain-inspired verification
- Version control
- Access control

### User Dashboard
- Assessment history
- Risk level tracking
- Health metrics visualization
- Personalized recommendations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

HealthHype is designed to be a supplementary tool and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.

## 👥 Authors

- Sujal Sakhare - [Github](https://github.com/rag3frost)

## 🙏 Acknowledgments

- scikit-learn team for ML tools
- Supabase team for backend infrastructure
- OpenAI for AI capabilities
- Medical professionals for domain expertise
