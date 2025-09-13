import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, AlertTriangle, Shield, BarChart3, Mountain, Brain, Zap, Users, Globe } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/pw/AP1GczPglrA4_0VH4D4-HVTxLCzhgo03yutjZ0y2oaOPKt1F1USiPTctVYfNsPHlFHbQ9O4Jt9IC4EpxK-yjeZ0R3BZn-Iy0_pmGK1P5iu3akaBYVQdblZp0nuquViOFRjLvB00WYu7xk5FaQIy-poG7ZSMeAQ=w397-h311-s-no-gm" 
                alt="RockSafe 360 Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="ml-3 text-xl font-bold text-white">RockSafe 360</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/pw/AP1GczOfbf7SCylLAhft8Q03wwpYBRl6Z-tzlC9smYPNBGy03fBO8SABzJSZZGDCNDb5WXqZxgZALSP3WKnt56rGoMfcE8YrOhYjBkOxpmyqPMWzrYSulYKFW1Ao9nngxH4xGze_8TI1BnRkMC3A3HRGD8CdvA=w1200-h639-s-no-gm')`
            }}
          />
          <div className="absolute inset-0 bg-navy-900 bg-opacity-40"/>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              AI-Powered Rockfall
              <br />
              <span className="text-safe-400">Prediction System</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto"
            >
              Revolutionary AI-based system for open-pit mines that processes multi-source data 
              including Digital Elevation Models, drone imagery, geotechnical sensors, and environmental factors 
              to predict rockfall incidents and enhance mining safety.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                <Brain className="w-5 h-5 inline mr-2" />
                Machine Learning Prediction
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                <Zap className="w-5 h-5 inline mr-2" />
                Real-time Alerts
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                <Globe className="w-5 h-5 inline mr-2" />
                Open-source Integration
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                <Users className="w-5 h-5 inline mr-2" />
                Mine Safety Focus
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                to="/dashboard"
                className="flex items-center px-8 py-4 bg-white text-navy-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Launch Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-navy-800 transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Multi-Source Data Integration
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Our system processes and analyzes multiple data sources including Digital Elevation Models (DEM), 
              drone-captured imagery, geotechnical sensor data, and environmental factors to provide 
              comprehensive rockfall risk assessment for open-pit mining operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center p-6 rounded-xl bg-blue-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
                <Mountain className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Digital Elevation Models</h4>
              <p className="text-sm text-gray-600">
                Topographic analysis and slope stability assessment
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-6 rounded-xl bg-green-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Drone Imagery</h4>
              <p className="text-sm text-gray-600">
                High-resolution aerial photography and AI image analysis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-orange-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sensor Data</h4>
              <p className="text-sm text-gray-600">
                Displacement, strain, and pore pressure monitoring
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-purple-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Environmental Factors</h4>
              <p className="text-sm text-gray-600">
                Rainfall, temperature, and vibration analysis
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mx-auto mb-6">
                <Brain className="w-8 h-8 text-navy-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Risk Prediction</h3>
              <p className="text-gray-600">
                Machine learning models identify patterns that precede rockfall events using 
                real-time sensor data and historical analysis for proactive decision-making.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-warning-100 rounded-full mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Alerts</h3>
              <p className="text-gray-600">
                Smart notification system with SMS/email integration, probability-based forecasts,
                and automated response protocols for mine operations teams.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-safe-100 rounded-full mx-auto mb-6">
                <Shield className="w-8 h-8 text-safe-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dashboard & Visualization</h3>
              <p className="text-gray-600">
                User-friendly web dashboard for mine planners with real-time risk maps, 
                vulnerable zone identification, and comprehensive reporting capabilities.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-6 py-20 bg-navy-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Proven Results
            </h2>
            <p className="text-xl text-gray-600">
              Our system has been tested and validated across multiple mining operations.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-gray-300 mb-2"><i>Beta</i></div>
              <div className="text-lg font-medium text-gray-900">Prediction Accuracy</div>
              <div className="text-gray-600">Early warning detection</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-navy-600 mb-2">24/7</div>
              <div className="text-lg font-medium text-gray-900">Continuous Monitoring</div>
              <div className="text-gray-600">Round-the-clock surveillance</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-navy-600 mb-2">&lt;2min</div>
              <div className="text-lg font-medium text-gray-900">Response Time</div>
              <div className="text-gray-600">Emergency alert delivery</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-black-600 mb-2">NA</div>
              <div className="text-lg font-medium text-gray-900">Active Sites</div>
              <div className="text-gray-600">Mines under protection</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20 bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-6"
          >
            Ready to Enhance Mine Safety?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            Experience the power of AI-driven rockfall prediction and monitoring.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
          </motion.div>
        </div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Made with ❤️ by</h2>
            <p className="text-xl text-gray-300">Amit, Suhani, Mudra, Prashant, Sohan, Reiyan</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-navy-900 border-t border-navy-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                <Mountain className="w-5 h-5 text-navy-600" />
              </div>
              <span className="ml-2 text-lg font-bold text-white">RockSafe 360</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 RockSafe 360. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
