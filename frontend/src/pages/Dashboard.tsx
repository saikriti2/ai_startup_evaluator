import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Send, Download, FileText, PieChart, Users, Target, Zap, Mail, TrendingUp, AlertCircle, Users2, Gauge } from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { ChartDisplay } from '../components/ChartDisplay';
import { RoadmapDisplay } from '../components/RoadmapDisplay';

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

## Financial Projections
- Year 1 Revenue: ${report.financial_projections?.year1_revenue || 'N/A'}
- Year 3 Revenue: ${report.financial_projections?.year3_revenue || 'N/A'}
- Year 5 Revenue: ${report.financial_projections?.year5_revenue || 'N/A'}
- Monthly Burn Rate: ${report.financial_projections?.burn_rate_monthly || 'N/A'}
- Break Even: ${report.financial_projections?.break_even_months || 'N/A'} months
- Initial Funding: ${report.financial_projections?.initial_funding_needed || 'N/A'}
- Projected Margin: ${report.financial_projections?.projected_margin || 'N/A'}

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
          Enter your startup vision. Our AI engine analyzes markets, competitors, financials, and roadmaps to generate a comprehensive investment-grade report.
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
            className="space-y-12"
          >
            {/* Header with Export Options */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="text-2xl font-bold">Comprehensive Analysis</h3>
              <div className="flex gap-4 flex-wrap">
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

            {/* Financial Projections Cards */}
            {report.financial_projections && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-white/50 text-sm mb-2">Year 1 Revenue</p>
                  <p className="text-2xl font-bold text-accent">{report.financial_projections.year1_revenue}</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-white/50 text-sm mb-2">Break Even</p>
                  <p className="text-2xl font-bold text-accent">{report.financial_projections.break_even_months} months</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-white/50 text-sm mb-2">Initial Funding</p>
                  <p className="text-2xl font-bold text-accent">{report.financial_projections.initial_funding_needed}</p>
                </div>
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-white/50 text-sm mb-2">Projected Margin</p>
                  <p className="text-2xl font-bold text-accent">{report.financial_projections.projected_margin}</p>
                </div>
              </motion.div>
            )}

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <ChartDisplay 
                type="revenue" 
                data={report} 
                title="Revenue Projections"
              />
              <ChartDisplay 
                type="breakdown" 
                data={report} 
                title="Revenue Breakdown"
              />
              <ChartDisplay 
                type="market" 
                data={report} 
                title="Market Size by Segment"
              />
            </motion.div>

            {/* Roadmap */}
            {report.roadmap && Object.keys(report.roadmap).length > 0 && (
              <RoadmapDisplay roadmap={report.roadmap} />
            )}

            {/* Main Report Cards */}
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
            </div>

            {/* Team Requirements */}
            {report.team_requirements && Object.keys(report.team_requirements).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Users2 size={20} className="text-accent" />
                  <h3 className="text-lg font-semibold text-white/90">Required Team</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(report.team_requirements).map(([role, requirements]) => (
                    <div key={role} className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <p className="text-accent font-semibold mb-2 capitalize">{role.replace(/_/g, ' ')}</p>
                      <p className="text-white/70 text-sm leading-relaxed">{requirements}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Success Metrics */}
            {report.success_metrics && report.success_metrics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Gauge size={20} className="text-accent" />
                  <h3 className="text-lg font-semibold text-white/90">Success Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.success_metrics.map((metric: string, idx: number) => (
                    <div key={idx} className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <p className="text-white/70 text-sm leading-relaxed">{metric}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Risks & Mitigations */}
            {report.risks_and_mitigations && report.risks_and_mitigations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle size={20} className="text-accent" />
                  <h3 className="text-lg font-semibold text-white/90">Risks & Mitigations</h3>
                </div>
                <div className="space-y-4">
                  {report.risks_and_mitigations.map((risk: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass rounded-xl p-6 border border-white/5 hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-semibold text-white/90">{risk.risk}</p>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            risk.likelihood === 'high' ? 'bg-red-500/20 text-red-400' :
                            risk.likelihood === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {risk.likelihood}
                          </span>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mb-3"><strong>Impact:</strong> {risk.impact}</p>
                      <p className="text-white/70 text-sm"><strong>Mitigation:</strong> {risk.mitigation}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Investor Pitch Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Mail size={20} className="text-accent" />
                <h3 className="text-lg font-semibold text-white/90">Investor Pitch Email</h3>
              </div>
              <div className="bg-black/50 rounded-xl p-6 border border-white/10 max-h-96 overflow-y-auto">
                <pre className="text-white/80 text-sm leading-relaxed font-mono whitespace-pre-wrap break-words">
                  {report.investor_pitch}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(report.investor_pitch);
                  alert('Investor pitch copied to clipboard!');
                }}
                className="mt-4 w-full px-6 py-3 bg-accent hover:bg-blue-600 text-white rounded-xl font-semibold transition-all"
              >
                📋 Copy Investor Pitch
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};