import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Zap, Target, CheckCircle, Mountain, BarChart3, AlertTriangle } from 'lucide-react';

export const About: React.FC = () => {
  const features = [
    {
      icon: Eye,
      title: 'Real-time Monitoring',
      description: 'Continuous 24/7 surveillance with AI-powered pattern recognition for early warning detection.'
    },
    {
      icon: AlertTriangle,
      title: 'Intelligent Alerts',
      description: 'Smart notification system with severity classification and automated response protocols.'
    },
    {
      icon: Shield,
      title: 'Comprehensive Protection',
      description: 'Multi-layered safety approach combining predictive analytics and emergency coordination.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Deep insights with correlation analysis, trend prediction, and performance metrics.'
    },
    {
      icon: Zap,
      title: 'Rapid Response',
      description: 'Sub-2-minute alert delivery with automated escalation and emergency protocols.'
    },
    {
      icon: Target,
      title: 'High Accuracy',
      description: '99.2% prediction accuracy with machine learning algorithms trained on geological data.'
    }
  ];

  const stats = [
    { label: 'Prediction Accuracy', value: '99.2%' },
    { label: 'Response Time', value: '<2min' },
    { label: 'Active Sites', value: '15+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  const benefits = [
    'Prevent rockfall accidents and fatalities',
    'Reduce operational downtime and costs',
    'Improve mine safety compliance',
    'Enable proactive maintenance scheduling',
    'Optimize excavation planning',
    'Enhance emergency response coordination'
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-navy-600 rounded-xl">
            <Mountain className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Based Rockfall Prediction & Alert System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced artificial intelligence technology for predicting and preventing rockfall incidents 
          in open-pit mining operations, ensuring maximum safety and operational efficiency.
        </p>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card text-center bg-gradient-to-r from-navy-50 to-navy-100"
      >
        <h2 className="text-3xl font-bold text-navy-800 mb-4">Our Mission</h2>
        <p className="text-lg text-navy-700 max-w-4xl mx-auto leading-relaxed">
          To revolutionize mining safety through cutting-edge AI technology that predicts, alerts, 
          and protects against rockfall hazards. We combine advanced sensor networks, machine learning 
          algorithms, and real-time monitoring to create the most reliable early warning system for 
          open-pit mining operations worldwide.
        </p>
      </motion.div>

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl font-bold text-navy-600 mb-2">{stat.value}</div>
            <div className="text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Core Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Core Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="text-center p-6 rounded-lg bg-gray-50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-navy-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend Technologies</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                React 18 with TypeScript for robust UI development
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Tailwind CSS for responsive design and styling
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Leaflet.js for interactive mapping and GIS visualization
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Recharts for advanced data visualization and analytics
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Framer Motion for smooth animations and interactions
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI & Data Processing</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Machine Learning algorithms for pattern recognition
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Real-time sensor data processing and analysis
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Predictive modeling with geological data integration
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Automated alert generation and escalation systems
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-safe-500 mr-3" />
                Cloud-based data storage and backup solutions
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card bg-gradient-to-r from-safe-50 to-safe-100"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Key Benefits</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center p-4 bg-white rounded-lg shadow-sm"
            >
              <CheckCircle className="w-6 h-6 text-safe-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center bg-navy-800 text-white rounded-xl p-12"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Enhance Mine Safety?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join the mining operations worldwide that trust our AI-powered rockfall prediction system 
          to keep their workers safe and operations running smoothly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button className="bg-white text-navy-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
            Schedule Demo
          </button>
          <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-navy-800 transition-colors">
            Contact Sales
          </button>
        </div>
      </motion.div>
    </div>
  );
};
