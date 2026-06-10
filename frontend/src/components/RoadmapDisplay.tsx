import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Target } from 'lucide-react';

interface RoadmapDisplayProps {
  roadmap: any;
}

export const RoadmapDisplay = ({ roadmap }: RoadmapDisplayProps) => {
  const phases = Object.entries(roadmap).sort((a, b) => {
    const numA = parseInt(a[0].replace('phase', ''));
    const numB = parseInt(b[0].replace('phase', ''));
    return numA - numB;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-8"
    >
      <h3 className="text-2xl font-semibold mb-8 text-white/90">Product Roadmap</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent to-blue-600" />
        
        {/* Phases */}
        <div className="space-y-8">
          {phases.map(([key, phase]: [string, any], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="ml-32 relative"
            >
              {/* Timeline dot */}
              <div className="absolute -left-28 top-2 w-4 h-4 bg-accent rounded-full border-4 border-black/50" />
              
              <div className="glass rounded-2xl p-6 border border-white/5 hover:border-accent/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-accent mb-1">{phase.months}</p>
                    <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                  </div>
                  <Target size={20} className="text-accent/50" />
                </div>
                
                <div className="space-y-2">
                  {phase.milestones?.map((milestone: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + idx * 0.05 }}
                      className="flex items-start gap-3 text-white/70 text-sm"
                    >
                      <CheckCircle2 size={16} className="text-accent/70 mt-1 flex-shrink-0" />
                      <span>{milestone}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};