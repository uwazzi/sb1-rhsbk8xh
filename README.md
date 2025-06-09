# AI Sanity Check - Empathy Assessment Platform

A comprehensive platform for evaluating AI systems using validated psychological assessment tools, with complete privacy through local language models. Built with React, Supabase, and deployed on Netlify.

## 🧠 Features

### Core Assessment Tools
- **Perth Empathy Scale (PES)** - Measures cognitive and affective empathy across positive and negative emotional contexts
- **Local LLM Processing** - Complete privacy with browser-based language models using WebLLM
- **Public Test Results** - Community transparency with publicly viewable assessments

### Empathy Investigator System
Our flagship feature provides clinical-grade empathy assessment for AI systems:

#### **Validated Assessment Framework**
- **20-item Perth Empathy Scale** with proper subscale categorization
- **Four empathy dimensions**: Negative Cognitive Empathy (NCE), Positive Cognitive Empathy (PCE), Negative Affective Empathy (NAE), Positive Affective Empathy (PAE)
- **Reverse scoring** handling for accurate clinical results
- **Real-time scoring** with standardized 5-point Likert scale

#### **Local LLM Integration**
- **Complete Privacy**: All processing happens in your browser using WebLLM
- **WebGPU Acceleration**: GPU-accelerated inference when available
- **Offline Capability**: Works without internet connection after initial model download
- **Multiple Models**: Support for various local language models (Llama, Phi, Gemma, Qwen)
- **Custom Personality Prompts**: Test different AI personalities and emotional states

#### **Agent Management System**
- **Multi-model support** for different AI architectures
- **Performance tracking** with historical empathy profiles
- **Comparative analysis** across different AI agents
- **Session management** with detailed response logging
- **Custom personality testing** with predefined psychological profiles

#### **Advanced Analytics**
- **Real-time empathy monitoring** with visual dashboards
- **Subscale breakdown** showing specific empathy strengths/weaknesses
- **Trend analysis** for tracking improvements over time
- **Clinical interpretation** with actionable insights

### Public Results & Community Features
- **Open Science Approach**: All test results are publicly viewable by default
- **Community Transparency**: Browse assessments from other researchers and developers
- **Premium Privacy**: Authenticated users can create private tests (premium feature)
- **Research Collaboration**: Share findings with the AI evaluation community

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
- **Local AI**: WebLLM for browser-based language models
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
- Modern browser with WebGPU support (recommended)

### Environment Variables
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## 🧪 Using the Empathy Investigator

### 1. Register an AI Agent
Navigate to `/empathy-investigator` and register your AI system:
- Provide agent name and model type
- Configure custom personality prompts (optional)
- Agent is now ready for assessment

### 2. Choose Assessment Type
- **Local LLM Assessment**: Complete privacy with browser-based models
- **Manual Assessment**: Traditional questionnaire format
- **AI Agent Assessment**: Automated conversational evaluation

### 3. Conduct Assessment
- Select registered agent
- Complete 20-item PES questionnaire or automated assessment
- Real-time progress tracking with subscale breakdown
- Custom personality prompts shape AI responses

### 4. Analyze Results
- View comprehensive empathy profile
- Compare performance across different agents
- Track improvements over time
- Export detailed reports

### 5. Share & Collaborate
- Results are publicly viewable by default
- Browse community assessments
- Premium users can create private tests
- Contribute to open AI evaluation research

## 🔐 Privacy & Security Features

### Local LLM Processing
- **Complete Privacy**: All AI processing happens in your browser
- **No Data Collection**: No responses or results leave your device
- **Offline Capability**: Works without internet after model download
- **WebGPU Acceleration**: GPU-powered inference when available

### Authentication & Access Control
- **Row Level Security (RLS)** on all database tables
- **User data isolation** with proper authentication
- **Public by default**: Promotes transparency and open science
- **Premium privacy**: Option for private tests with subscription

### GDPR Compliance
- **Minimal data collection** with explicit consent
- **User control** over data sharing and privacy
- **Right to deletion** and data portability
- **Transparent privacy practices**

## 📈 Clinical Validation

The Perth Empathy Scale implementation follows validated clinical protocols:
- **Research Reference**: PMC10670358
- **Subscale Structure**: 4 dimensions × 5 items each
- **Scoring Method**: 5-point Likert scale with reverse scoring
- **Clinical Interpretation**: Standardized empathy profiling

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

### Open Science Community
- **Transparent evaluation** with public results
- **Collaborative research** across institutions
- **Reproducible assessments** with standardized tools
- **Community benchmarking** of AI systems

## 🛣️ Roadmap

### Phase 1 (Current) ✅
- ✅ Perth Empathy Scale implementation
- ✅ Local LLM integration with WebLLM
- ✅ Agent registration and management
- ✅ Real-time assessment interface
- ✅ Public results and community features
- ✅ Comprehensive analytics dashboard

### Phase 2 (Q2 2025)
- 🔄 NEO-PI-R personality assessment
- 🔄 Multi-language support
- 🔄 API access for enterprise integration
- 🔄 Advanced statistical analysis
- 🔄 Premium subscription features

### Phase 3 (Q3 2025)
- 📋 PCL-R psychopathy assessment
- 📋 Custom assessment builder
- 📋 Team collaboration features
- 📋 White-label solutions
- 📋 Research publication tools

## 🌟 Latest Updates

### v2.0 - Privacy-First & Community-Driven
- **Local LLM Integration**: Complete privacy with WebLLM
- **Public Results**: Community transparency by default
- **Premium Privacy**: Optional private tests for subscribers
- **Enhanced UI/UX**: Beautiful, production-ready interface
- **Performance Optimization**: Faster assessments with real-time analysis

### Key Improvements
- **Removed External APIs**: No more Gemini dependency
- **Browser-Based Processing**: All AI evaluation happens locally
- **Community Features**: Public test browsing and sharing
- **Freemium Model**: Free public access, premium for privacy
- **Mobile Optimization**: Responsive design for all devices

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
- **WebLLM Team** for enabling privacy-first AI processing
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

*Bringing psychological transparency to artificial intelligence with complete privacy*

## 🔗 Quick Links

- **Live Demo**: [View Public Test Results](https://friendly-melomakarona-419814.netlify.app/view-tests)
- **Start Assessment**: [Empathy Investigator](https://friendly-melomakarona-419814.netlify.app/empathy-investigator)
- **Documentation**: [Learn More](https://friendly-melomakarona-419814.netlify.app/documentation)
- **Community**: [Browse Public Results](https://friendly-melomakarona-419814.netlify.app/view-tests)