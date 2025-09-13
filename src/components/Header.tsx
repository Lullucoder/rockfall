import React, { useState } from 'react';
import { Bell, Settings, User, Search, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 relative z-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-gray-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-navy-800 truncate">
              <span className="hidden sm:inline">RockSafe 360 Dashboard</span>
              <span className="sm:hidden">RockSafe 360</span>
            </h1>
            <div className="hidden lg:flex items-center text-xs sm:text-sm text-gray-500">
              <span className="w-2 h-2 bg-safe-500 rounded-full mr-2 animate-pulse"></span>
              System Status: Online
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Mobile Search Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <Search className="w-5 h-5" />
          </motion.button>

          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search zones, alerts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none text-sm w-48 lg:w-64"
            />
          </div>
          
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </motion.button>
          
          {/* Settings */}
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex p-2 text-gray-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <Settings className="w-5 h-5" />
          </motion.button> */}
          
          {/* User Menu */}
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 p-2 text-gray-600 hover:text-navy-600 hover:bg-gray-100 rounded-lg transition-colors touch-target"
          >
            <User className="w-5 h-5" />
            <span className="hidden lg:block font-medium">RockSafe</span>
          </motion.button> */}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-3 pt-3 border-t border-gray-200"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search zones, alerts..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none text-base"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
