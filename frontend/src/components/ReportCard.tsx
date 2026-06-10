import React from 'react';
import { motion } from 'framer-motion';

interface ReportCardProps {
  title: string;
  content: string;
  delay?: number;
  icon?: React.ReactNode;
}

export const ReportCard = ({ title, content, delay = 0, icon }: ReportCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-3xl p-8 glass-hover h-full flex flex-col border border-white/5"
    >
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-accent">{icon}</div>}
        <h3 className="text-lg font-semibold text-white/90">{title}</h3>
      </div>
      <div className="text-white/60 leading-relaxed text-sm whitespace-pre-wrap flex-1">
        {content}
      </div>
    </motion.div>
  );
};
