import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, AlertTriangle, Shield, BarChart3, Mountain } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
              <div className="w-6 h-6 text-navy-600">
                <Mountain />
              </div>
            </div>
            <span className="ml-3 text-xl font-bold text-white">RPA</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
            <Link to="/team" className="text-gray-300 hover:text-white transition-colors">Team</Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
            <Link to="/dashboard" className="btn-primary">
              Open Dashboard
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6"
            >
              Predict. Alert. Protect.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              AI-driven rockfall monitoring system for open-pit mines. 
              Real-time prediction, intelligent alerts, and comprehensive protection.
            </motion.p>
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
              Advanced Monitoring Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered system provides comprehensive rockfall prediction and monitoring 
              for enhanced mine safety and operational efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-navy-100 rounded-full mx-auto mb-6">
                <Eye className="w-8 h-8 text-navy-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Monitoring</h3>
              <p className="text-gray-600">
                Continuous sensor data collection and analysis with AI-powered pattern recognition 
                for early warning detection.
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Alerts</h3>
              <p className="text-gray-600">
                Smart notification system with severity classification and automated response 
                protocols for immediate action.
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Protection</h3>
              <p className="text-gray-600">
                Multi-layered safety approach combining predictive analytics, risk assessment, 
                and emergency response coordination.
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
              <div className="text-4xl font-bold text-navy-600 mb-2">99.2%</div>
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
              <div className="text-4xl font-bold text-navy-600 mb-2">15+</div>
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
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-navy-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="mr-2 w-5 h-5" />
              Explore Dashboard
            </Link>
          </motion.div>
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
              <span className="ml-2 text-lg font-bold text-white">RPA System</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Rockfall Prediction & Alert System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
