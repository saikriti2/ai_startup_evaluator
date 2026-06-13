import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
 
const Sidebar = () => {
  const location = useLocation();
  
  const links = [
    { name: 'Evaluate', path: '/', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
  ];
 
  return (
    <div className="w-64 h-screen glass border-r border-white/10 flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
          <Rocket className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">VisionAI</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
 
      {/* Status indicator */}
      <div className="mt-auto px-4 py-4 rounded-2xl glass border border-white/5">
        <p className="text-xs text-white/40 mb-1">Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">AI Engine Online</span>
        </div>
      </div>
    </div>
  );
};
 
export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};