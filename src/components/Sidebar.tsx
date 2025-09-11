import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  BarChart3, 
  Info,
  Users,
  Mail,
  Mountain,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Main monitoring view'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Advanced analytics'
  },
  {
    name: 'AI Assessment',
    href: '/ai-assessment',
    icon: Brain,
    description: 'AI-powered risk analysis'
  },
  {
    name: 'About',
    href: '/about',
    icon: Info,
    description: 'About the system'
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
    description: 'Our team'
  },
  {
    name: 'Contact',
    href: '/contact',
    icon: Mail,
    description: 'Get in touch'
  }
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col w-64 bg-white shadow-lg border-r border-gray-200 h-full"
    >
      {/* Logo */}
      <div className="flex items-center px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-navy-600 rounded-lg">
            <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-base sm:text-lg font-bold text-navy-800">RPA</h2>
            <p className="text-xs text-gray-500">Rockfall Prediction</p>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-navy-50 border-b border-gray-200">
        <p className="text-sm text-navy-700 font-medium">
          Predict. Alert. Protect.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          AI-driven rockfall monitoring for open-pit mines
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={() =>
                `flex items-center px-3 sm:px-4 py-3 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-target ${
                  isActive
                    ? 'bg-navy-100 text-navy-700 border-r-2 border-navy-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{item.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-navy-600 rounded-full flex-shrink-0"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Status Panel */}
      <div className="px-3 sm:px-4 py-4 sm:py-6 border-t border-gray-200">
        <div className="bg-safe-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-safe-500 rounded-full mr-3 animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-safe-800 truncate">System Online</p>
              <p className="text-xs text-safe-600 truncate">All sensors active</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
