import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Send, Download, FileText, PieChart, Users, Target, Zap, Mail, TrendingUp } from 'lucide-react';
import { ReportCard } from '../components/ReportCard';

const API_BASE = "http://localhost:8000";

export const Dashboard = () => {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    
    setLoading(true);
    setReport(null);
    try {
      const res = await axios.post(`${API_BASE}/evaluate`, { idea });
      setReport(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to evaluate idea. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const exportAsMarkdown = () => {
    if (!report) return;
    const content = `
# Startup Evaluation: ${report.idea}

## Executive Summary
${report.executive_summary}

## Market Opportunity
${report.market_opportunity}

## Competitor Analysis
${report.competitor_analysis}

## SWOT Analysis
${report.swot_analysis}

## Revenue Model
${report.revenue_model}

## Launch Plan
${report.launch_plan}

## Investor Pitch
${report.investor_pitch}
    `;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.id}.md`;
    a.click();
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h2 className="text-5xl font-bold tracking-tight">Evaluate your next <span className="premium-gradient">big idea.</span></h2>
        <p className="text-white/40 text-lg max-w-2xl">
          Enter your startup vision below. Our AI engine will analyze market trends, competition, and feasibility to generate a comprehensive 7-point report.
        </p>
      </div>

      {/* Input Section */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass rounded-[2rem] p-4 flex flex-col md:flex-row items-end gap-4">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea in detail..."
            className="w-full bg-transparent border-none focus:ring-0 text-xl p-4 min-h-[120px] resize-none"
          />
          <button
            disabled={loading}
            className="bg-accent hover:bg-blue-600 text-white p-6 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-accent/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={24} />
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Analysis Results</h3>
              <div className="flex gap-4">
                <button 
                  onClick={exportAsMarkdown}
                  className="flex items-center gap-2 px-6 py-3 glass rounded-2xl text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <FileText size={18} /> Export MD
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ReportCard 
                  title="Executive Summary" 
                  content={report.executive_summary} 
                  icon={<Zap size={20} />}
                  delay={0.1}
                />
              </div>
              <ReportCard 
                title="Market Opportunity" 
                content={report.market_opportunity} 
                icon={<TrendingUp size={20} />}
                delay={0.2}
              />
              <ReportCard 
                title="Competitor Analysis" 
                content={report.competitor_analysis} 
                icon={<Users size={20} />}
                delay={0.3}
              />
              <ReportCard 
                title="SWOT Analysis" 
                content={report.swot_analysis} 
                icon={<Target size={20} />}
                delay={0.4}
              />
              <ReportCard 
                title="Revenue Model" 
                content={report.revenue_model} 
                icon={<PieChart size={20} />}
                delay={0.5}
              />
              <div className="lg:col-span-2">
                <ReportCard 
                  title="Launch Plan" 
                  content={report.launch_plan} 
                  icon={<Rocket size={20} />}
                  delay={0.6}
                />
              </div>
              <div className="lg:col-span-3">
                <ReportCard 
                  title="Investor Pitch Email" 
                  content={report.investor_pitch} 
                  icon={<Mail size={20} />}
                  delay={0.7}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
