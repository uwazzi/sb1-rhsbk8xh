# AI Sanity Check - Psychological Evaluation Platform

A comprehensive platform for psychologically evaluating AI systems using validated clinical assessment tools. Built with React, Supabase, and deployed on Netlify.

## 🧠 Features

### Core Assessment Tools
- **Perth Empathy Scale (PES)** - Measures cognitive and affective empathy across positive and negative emotional contexts
- **NEO Personality Inventory (NEO-PI-R)** - Comprehensive personality assessment across the Big Five dimensions *(Coming Soon)*
- **Psychopathy Checklist-Revised (PCL-R)** - Assesses psychopathic traits and behaviors *(Coming Soon)*

### PES Investigator Agent System
Our flagship feature provides clinical-grade empathy assessment for AI systems:

#### **Validated Assessment Framework**
- **20-item Perth Empathy Scale** with proper subscale categorization
- **Four empathy dimensions**: Negative Cognitive Empathy (NCE), Positive Cognitive Empathy (PCE), Negative Affective Empathy (NAE), Positive Affective Empathy (PAE)
- **Reverse scoring** handling for accurate clinical results
- **Real-time scoring** with standardized 5-point Likert scale

#### **Agent Management System**
- **Multi-model support** for Gemini, GPT-4, Claude, and other AI systems
- **Performance tracking** with historical empathy profiles
- **Comparative analysis** across different AI agents
- **Session management** with detailed response logging

#### **Advanced Analytics**
- **Real-time empathy monitoring** with visual dashboards
- **Subscale breakdown** showing specific empathy strengths/weaknesses
- **Trend analysis** for tracking improvements over time
- **Clinical interpretation** with actionable insights

### User Experience
- **Beautiful, responsive design** optimized for all devices
- **Guest access** with magic link authentication
- **Comprehensive onboarding** with user profiling wizard
- **Real-time progress tracking** during assessments
- **Detailed results visualization** with radar charts and insights

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth with magic links
- **AI Integration**: Gemini API, OpenAI API support
- **Deployment**: Netlify with edge functions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📊 Database Schema

### Core Tables
- `test_configurations` - Test setup and metadata
- `test_responses` - Individual question responses
- `test_results` - Final analysis and scores
- `guest_profiles` - User onboarding data

### PES Investigator Tables
- `pes_items` - Validated 20-item Perth Empathy Scale questions
- `agent_registry` - AI agent registration and metadata
- `pes_test_sessions` - Assessment sessions with scoring
- `pes_responses` - Individual item responses with timing

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- Supabase account
- Gemini API key (or other LLM API keys)

### Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-sanity-check

# Install dependencies
npm install

# Run database migrations
# (Migrations are automatically applied via Supabase)

# Start development server
npm run dev
```

### Deployment
```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 🧪 Using the PES Investigator

### 1. Register an AI Agent
Navigate to `/pes-investigator` and register your AI system:
- Provide agent name and model type
- Configure any specific parameters
- Agent is now ready for assessment

### 2. Conduct Assessment
- Select registered agent
- Complete 20-item PES questionnaire
- Responses are automatically scored across 4 empathy dimensions
- Real-time progress tracking with subscale breakdown

### 3. Analyze Results
- View comprehensive empathy profile
- Compare performance across different agents
- Track improvements over time
- Export detailed reports

### 4. Monitor Performance
- Real-time dashboard with agent statistics
- Historical trend analysis
- Comparative empathy profiles
- Session management and analytics

## 📈 Clinical Validation

The Perth Empathy Scale implementation follows validated clinical protocols:
- **Research Reference**: PMC10670358
- **Subscale Structure**: 4 dimensions × 5 items each
- **Scoring Method**: 5-point Likert scale with reverse scoring
- **Clinical Interpretation**: Standardized empathy profiling

## 🔐 Security & Privacy

- **Row Level Security (RLS)** on all database tables
- **User data isolation** with proper authentication
- **Secure API endpoints** with proper authorization
- **No data sharing** between users without explicit consent
- **GDPR compliant** data handling

## 🎯 Use Cases

### AI Development Teams
- **Pre-deployment screening** for empathy capabilities
- **Model comparison** across different architectures
- **Training validation** for empathy-focused fine-tuning
- **Regression testing** for empathy preservation

### Research Organizations
- **Clinical AI research** with validated instruments
- **Empathy benchmarking** across AI systems
- **Longitudinal studies** of AI empathy development
- **Publication-ready** assessment data

### Enterprise Applications
- **Customer service AI** empathy validation
- **Healthcare AI** emotional intelligence screening
- **Educational AI** empathy assessment
- **Therapeutic AI** clinical readiness evaluation

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Perth Empathy Scale implementation
- ✅ Agent registration and management
- ✅ Real-time assessment interface
- ✅ Comprehensive analytics dashboard

### Phase 2 (Q2 2025)
- 🔄 NEO-PI-R personality assessment
- 🔄 Multi-language support
- 🔄 API access for enterprise integration
- 🔄 Advanced statistical analysis

### Phase 3 (Q3 2025)
- 📋 PCL-R psychopathy assessment
- 📋 Custom assessment builder
- 📋 Team collaboration features
- 📋 White-label solutions

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for:
- Code style and standards
- Testing requirements
- Documentation updates
- Feature proposals

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Perth Empathy Scale** developers for the validated assessment framework
- **Supabase** for the excellent backend-as-a-service platform
- **Netlify** for seamless deployment and hosting
- **HG Labs** for powering the development infrastructure

## 📞 Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Contact us at support@aisanitycheck.com
- Visit our documentation at `/documentation`

---

**Built with ❤️ by the AI Sanity Check team**

*Bringing psychological transparency to artificial intelligence*