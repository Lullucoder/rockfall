# AI-Based Rockfall Prediction & Alert System

A comprehensive React-based dashboard for monitoring mining operations and predicting rockfall hazards using advanced AI algorithms and real-time sensor data.

![Dashboard Preview](https://via.placeholder.com/800x400/1f2937/ffffff?text=Rockfall+Prediction+Dashboard)

## 🚀 Features

### Core Functionality
- **Real-time Monitoring**: Live sensor data tracking with instant updates
- **Interactive Risk Map**: Visual representation of mining zones with color-coded risk levels
- **AI-Powered Predictions**: Machine learning algorithms for rockfall risk assessment
- **Alert Management**: Automated warning system with multiple severity levels
- **Data Visualization**: Comprehensive charts and analytics for trend analysis
- **Export Capabilities**: Generate detailed reports in PDF format

### Dashboard Components
- **Landing Page**: Marketing homepage with system overview and statistics
- **Main Dashboard**: Central monitoring interface with real-time metrics
- **Analytics**: Advanced data visualization and performance insights
- **About System**: Technical specifications and technology stack
- **Team Directory**: Development team profiles and expertise
- **Contact Support**: Help desk and FAQ section

## 🛠️ Technology Stack

### Frontend Framework
- **React 18**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast development server and build tool

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library

### Data Visualization
- **Leaflet.js**: Interactive mapping with OpenStreetMap
- **Recharts**: Responsive chart library for React
- **GeoJSON**: Geographic data visualization

### Development Tools
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization
- **Node.js**: JavaScript runtime environment

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rockfall-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5174`

## 🎯 Usage Guide

### Navigation
- **Dashboard**: Main monitoring interface with live data
- **Analytics**: Detailed charts and performance metrics
- **About**: System information and technical details
- **Team**: Development team profiles
- **Contact**: Support and help resources

### Key Features
- **Risk Map**: Interactive zones with real-time risk assessment
- **Alert Panel**: Live notifications with severity classification
- **Sensor Charts**: Displacement and rainfall monitoring
- **Export Reports**: Generate comprehensive PDF reports

## 📊 Mock Data

The application includes comprehensive mock data for demonstration:

### Risk Zones
- Zone A (High Risk): Active monitoring area
- Zone B (Medium Risk): Standard surveillance
- Zone C (Low Risk): Routine inspection area

### Sensor Types
- **Displacement Sensors**: Movement detection and tracking
- **Rainfall Monitors**: Weather impact assessment
- **Seismic Detectors**: Ground stability analysis

### Alert Categories
- **Critical**: Immediate evacuation required
- **Warning**: Enhanced monitoring activated
- **Info**: Standard operational updates

## 🔧 Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint code analysis

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Navigation header
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── RiskMap.tsx     # Interactive mapping
│   ├── AlertsPanel.tsx # Alert management
│   ├── SensorCharts.tsx# Data visualization
│   ├── RiskGauge.tsx   # Risk level indicator
│   └── ExportReport.tsx# Report generation
├── pages/              # Application pages
│   ├── Landing.tsx     # Homepage
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Analytics.tsx   # Advanced analytics
│   ├── About.tsx       # System information
│   ├── Team.tsx        # Team profiles
│   └── Contact.tsx     # Support page
├── data/               # Mock data files
│   ├── mockZones.ts    # Risk zone data
│   ├── mockSensors.ts  # Sensor information
│   └── mockAlerts.ts   # Alert notifications
├── App.tsx             # Main application
└── main.tsx            # Application entry point
```

## 🌐 Deployment

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

The application will be built to the `dist/` directory and can be deployed to any static hosting service.

## � Gemini AI Summaries (Optional)

Add concise AI-generated summaries of alerts, sensor risk snapshots, or slope images using Google's Gemini (free tier).

### Setup
1. Enable the Generative Language API in Google AI Studio and create an API key.
2. Copy `.env.example` to `.env.local` and set your key:
  ```bash
  VITE_GEMINI_API_KEY=YOUR_KEY_HERE
  ```
3. Install dependency (already in package if you pulled latest):
  ```bash
  npm install @google/generative-ai
  ```
4. Restart the dev server so Vite picks up the env var.

### Components
- `AISummaryPanel` – Generates a textual summary for current alerts (auto-included under Alerts) or sensor risk snapshot.
- `ImageSummaryUploader` – Upload a slope / bench image and receive a concise geotechnical-style note.

### Usage
- Alerts view: Click "Generate" in the AI Summary (Gemini) panel after alerts load.
- Image analysis: Import and place `<ImageSummaryUploader />` in any dashboard section or sidebar.

### Environment Variable
`VITE_GEMINI_API_KEY` is exposed client-side (Vite prefix requirement). Do NOT commit a real key; use `.env.local` which is gitignored.

### Privacy / Cost Notes
- Prompts include only minimal structured data (no raw sensor time series) to reduce tokens.
- Handle absence of key gracefully; UI will show a simple message.
- For stricter security move calls to a backend proxy to avoid exposing the key.

### Future Enhancements
- Streaming token UI
- Model selector (flash vs pro)
- Function calling for structured mitigation recommendations
- Rate limit / debounce guard

---

## �🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For technical support and questions:
- Email: support@rockfall-system.com
- Documentation: [System Docs](https://docs.rockfall-system.com)
- Issues: [GitHub Issues](https://github.com/your-org/rockfall-dashboard/issues)

---

**Built with ❤️ for mining safety and operational excellence**
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
