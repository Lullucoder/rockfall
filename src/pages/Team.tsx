import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Award, GraduationCap } from 'lucide-react';

export const Team: React.FC = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Lead AI Researcher',
      bio: 'PhD in Machine Learning from MIT, 10+ years in predictive analytics for mining safety.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      expertise: ['Machine Learning', 'Geological Modeling', 'Risk Assessment'],
      education: 'PhD MIT, MS Stanford',
      github: 'sarahchen',
      linkedin: 'sarahchen-ai',
      email: 'sarah.chen@rpa.com'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Senior Geotechnical Engineer',
      bio: 'Mining engineer with 15+ years experience in slope stability and rockfall prediction.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      expertise: ['Slope Stability', 'Rock Mechanics', 'Field Operations'],
      education: 'MS Mining Engineering, Colorado School of Mines',
      github: 'mrodriguez',
      linkedin: 'michael-rodriguez-mining',
      email: 'michael.rodriguez@rpa.com'
    },
    {
      name: 'Emily Johnson',
      role: 'Frontend Developer',
      bio: 'Full-stack developer specializing in React and data visualization for scientific applications.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      expertise: ['React/TypeScript', 'Data Visualization', 'UI/UX Design'],
      education: 'BS Computer Science, UC Berkeley',
      github: 'emilyjohnson',
      linkedin: 'emily-johnson-dev',
      email: 'emily.johnson@rpa.com'
    },
    {
      name: 'Dr. James Liu',
      role: 'Data Scientist',
      bio: 'Sensor data analysis expert with background in IoT systems and real-time processing.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      expertise: ['IoT Systems', 'Real-time Analytics', 'Sensor Networks'],
      education: 'PhD Data Science, Carnegie Mellon',
      github: 'jamesliu',
      linkedin: 'james-liu-data',
      email: 'james.liu@rpa.com'
    },
    {
      name: 'Rachel Thompson',
      role: 'Safety Systems Engineer',
      bio: 'Safety engineering specialist focused on emergency response systems and protocol development.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face',
      expertise: ['Safety Protocols', 'Emergency Response', 'Risk Management'],
      education: 'MS Safety Engineering, Texas A&M',
      github: 'rachelthompson',
      linkedin: 'rachel-thompson-safety',
      email: 'rachel.thompson@rpa.com'
    },
    {
      name: 'David Park',
      role: 'DevOps Engineer',
      bio: 'Cloud infrastructure and deployment specialist ensuring 99.9% system uptime.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face',
      expertise: ['Cloud Infrastructure', 'System Monitoring', 'CI/CD'],
      education: 'BS Computer Engineering, Georgia Tech',
      github: 'davidpark',
      linkedin: 'david-park-devops',
      email: 'david.park@rpa.com'
    }
  ];

  const advisors = [
    {
      name: 'Prof. Margaret Williams',
      role: 'Technical Advisor',
      affiliation: 'Stanford University - Geological Sciences',
      expertise: 'Rock mechanics and slope stability research'
    },
    {
      name: 'Dr. Robert Anderson',
      role: 'Industry Advisor',
      affiliation: 'Former VP Safety, BHP Billiton',
      expertise: 'Mining safety and operational excellence'
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A diverse group of experts in AI, mining engineering, safety systems, and software development, 
          united by our mission to revolutionize mining safety through innovative technology.
        </p>
      </motion.div>

      {/* Team Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="card hover:shadow-lg transition-shadow duration-300"
          >
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-navy-100"
              />
              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-navy-600 font-medium">{member.role}</p>
            </div>

            {/* Bio */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.bio}</p>

            {/* Education */}
            <div className="flex items-center mb-4 text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-2 text-navy-500" />
              <span>{member.education}</span>
            </div>

            {/* Expertise Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {member.expertise.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-2 py-1 bg-navy-100 text-navy-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
              <a
                href={`https://github.com/${member.github}`}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={`${member.name}'s GitHub`}
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={`https://linkedin.com/in/${member.linkedin}`}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${member.email}`}
                className="text-gray-400 hover:text-navy-600 transition-colors"
                aria-label={`Email ${member.name}`}
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Advisors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card bg-gradient-to-r from-navy-50 to-navy-100"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Advisory Board</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {advisors.map((advisor, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-navy-100 rounded-full mx-auto mb-4">
                <Award className="w-6 h-6 text-navy-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{advisor.name}</h3>
              <p className="text-navy-600 font-medium mb-2">{advisor.role}</p>
              <p className="text-sm text-gray-600 mb-2">{advisor.affiliation}</p>
              <p className="text-sm text-gray-700">{advisor.expertise}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Company Culture */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Culture & Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Mission-Driven</h3>
            <p className="text-gray-600">
              Every team member is passionate about saving lives and improving mining safety through innovative technology.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Collaborative</h3>
            <p className="text-gray-600">
              We believe the best solutions come from diverse perspectives and cross-functional collaboration.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation-First</h3>
            <p className="text-gray-600">
              We continuously push the boundaries of what's possible with AI and sensor technology.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Join Us CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="text-center bg-navy-800 text-white rounded-xl p-12"
      >
        <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          We're always looking for talented individuals who share our passion for mining safety and cutting-edge technology.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button className="bg-white text-navy-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
            View Open Positions
          </button>
          <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-navy-800 transition-colors">
            Send Us Your Resume
          </button>
        </div>
      </motion.div>
    </div>
  );
};
