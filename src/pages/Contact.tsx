import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Calendar, Globe } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (mock for demo)
    alert('Thank you for your message! We will get back to you within 24 hours.');
    setFormData({ name: '', email: '', company: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'contact@rockfallprediction.com',
      description: 'Send us an email and we\'ll respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM PST for immediate assistance'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: '123 Innovation Drive, Tech Valley, CA 94025',
      description: 'Our headquarters and main development center'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon-Fri: 9AM-6PM PST',
      description: '24/7 emergency support for active customers'
    }
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: 'Technical Support',
      description: 'Get help with system setup, configuration, and troubleshooting',
      action: 'Open Support Ticket'
    },
    {
      icon: Calendar,
      title: 'Schedule Demo',
      description: 'Book a personalized demonstration of our rockfall prediction system',
      action: 'Book Demo Call'
    },
    {
      icon: Globe,
      title: 'Global Partners',
      description: 'Connect with our certified partners in your region',
      action: 'Find Local Partner'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ready to revolutionize your mining operation's safety? We're here to help you implement 
          the most advanced rockfall prediction system in the industry.
        </p>
      </motion.div>

      {/* Contact Methods Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {contactInfo.map((info, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-lg mx-auto mb-4">
              <info.icon className="w-6 h-6 text-navy-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-navy-600 font-medium mb-2">{info.content}</p>
            <p className="text-sm text-gray-600">{info.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-colors"
                  placeholder="RockSafe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-colors"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company/Organization
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-colors"
                placeholder="Mining Corp Ltd."
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="demo">Request Demo</option>
                <option value="pricing">Pricing Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="general">General Question</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none transition-colors resize-vertical"
                placeholder="Tell us about your mining operation and how we can help improve safety..."
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-navy-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-navy-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Message
            </motion.button>
          </form>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How Can We Help?</h2>
            <div className="space-y-6">
              {supportOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-navy-300 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-navy-100 rounded-lg flex-shrink-0">
                      <option.icon className="w-5 h-5 text-navy-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      <button className="text-navy-600 font-medium hover:text-navy-700 transition-colors">
                        {option.action} →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card bg-danger-50 border-danger-200"
          >
            <h3 className="text-lg font-bold text-danger-800 mb-3">Emergency Support</h3>
            <p className="text-danger-700 mb-4">
              For critical system issues affecting mine safety, contact our 24/7 emergency support line:
            </p>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-danger-600" />
              <span className="text-lg font-bold text-danger-800">+1 (555) 911-ROCK</span>
            </div>
            <p className="text-sm text-danger-600 mt-2">
              Available 24/7 for existing customers with active support contracts
            </p>
          </motion.div>

          {/* Map Placeholder */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="card"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Visit Our Office</h3>
            <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p>Interactive map would be here</p>
                <p className="text-sm">123 Innovation Drive, Tech Valley, CA</p>
              </div>
            </div>
          </motion.div> */}
        </motion.div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">How quickly can the system be deployed?</h3>
            <p className="text-gray-600 mb-6">
              Typically 2-4 weeks depending on site size and complexity. Our team handles installation, 
              calibration, and training to ensure smooth deployment.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's included in the support package?</h3>
            <p className="text-gray-600">
              24/7 monitoring, regular system updates, preventive maintenance, on-site support visits, 
              and comprehensive training for your team.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Is the system customizable for different mine types?</h3>
            <p className="text-gray-600 mb-6">
              Yes, our AI algorithms adapt to various geological conditions, mine layouts, and operational 
              requirements. Each deployment is tailored to your specific needs.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">What's the ROI on the investment?</h3>
            <p className="text-gray-600">
              Most customers see ROI within 6-12 months through reduced incidents, lower insurance costs, 
              decreased downtime, and improved operational efficiency.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
