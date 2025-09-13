import React, { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

interface SimpleLayoutProps {
  children: ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-50 to-blue-50 opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-l from-navy-100 to-transparent opacity-30 transform rotate-12" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo Section */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-3 text-navy-700 hover:text-navy-800 transition-all duration-300 group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                >
                  <Logo size="medium" className="rounded-xl" />
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-navy-600 to-navy-800 bg-clip-text text-transparent">
                    RockSafe 360
                  </span>
                  <span className="text-xs text-gray-500 font-medium">Monitoring System</span>
                </div>
              </Link>
              
              {/* Status Indicator */}
              <div className="hidden md:flex items-center space-x-2 ml-6 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">System Online</span>
              </div>
            </div>

            {/* Enhanced Navigation */}
            <nav className="flex items-center space-x-2">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === '/dashboard'
                    ? 'bg-navy-100 text-navy-700 shadow-md'
                    : 'text-gray-600 hover:text-navy-700 hover:bg-navy-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/about"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === '/about'
                    ? 'bg-navy-100 text-navy-700 shadow-md'
                    : 'text-gray-600 hover:text-navy-700 hover:bg-navy-50'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </Link>
              
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-navy-700 hover:bg-navy-50 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content with Enhanced Background */}
      <main className="relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='50' cy='50' r='4'/%3E%3Ccircle cx='10' cy='10' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};