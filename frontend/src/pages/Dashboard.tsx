import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
 
const API_BASE = "http://localhost:8000";
 
// Chart data
const marketGrowthData = [
  { month: 'Jan', market: 2400, competitor: 1400 },
  { month: 'Feb', market: 3210, competitor: 2210 },
  { month: 'Mar', market: 2290, competitor: 1290 },
  { month: 'Apr', market: 2000, competitor: 1800 },
  { month: 'May', market: 2181, competitor: 2100 },
  { month: 'Jun', market: 2500, competitor: 2500 },
];
 
const revenueProjection = [
  { year: 'Year 1', revenue: 50 },
  { year: 'Year 2', revenue: 150 },
  { year: 'Year 3', revenue: 400 },
  { year: 'Year 4', revenue: 850 },
  { year: 'Year 5', revenue: 1500 },
];
 
const swotDistribution = [
  { name: 'Strengths', value: 35, fill: '#10b981' },
  { name: 'Weaknesses', value: 20, fill: '#ef4444' },
  { name: 'Opportunities', value: 30, fill: '#3b82f6' },
  { name: 'Threats', value: 15, fill: '#f59e0b' },
];
 
interface EvaluationResult {
  id?: number;
  idea: string;
  executive_summary: string;
  market_opportunity: string;
  competitor_analysis: string;
  swot_analysis: string;
  revenue_model: string;
  launch_plan: string;
  investor_pitch: string;
  created_at?: string;
}
 
export const Dashboard = () => {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
 
  const handleSubmit = async () => {
    if (!idea.trim()) {
      setError("Please enter a startup idea before submitting.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post(`${API_BASE}/evaluate`, { idea });
      setResult(res.data);
    } catch (err) {
      setError("Failed to connect to backend. Make sure the server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  const handleClear = () => {
    setIdea("");
    setResult(null);
    setError("");
    setCopySuccess(false);
  };
 
  const handleCopy = async () => {
    if (!result?.investor_pitch) return;
    try {
      await navigator.clipboard.writeText(result.investor_pitch);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.investor_pitch;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };
 
  const handleRegenerate = async () => {
    if (!idea.trim()) return;
    setRegenLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/evaluate`, { idea });
      setResult(res.data);
      setCopySuccess(false);
    } catch (err) {
      setError("Regeneration failed. Try again.");
      console.error(err);
    } finally {
      setRegenLoading(false);
    }
  };
 
  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.headerSection}>
        <h1 style={styles.title}>🚀 Startup Idea Evaluator</h1>
        <p style={styles.subtitle}>
          Enter your startup idea and get a full AI-powered evaluation with market insights
        </p>
      </div>
 
      {/* ── Input Section ── */}
      <section style={styles.card}>
        <label style={styles.label} htmlFor="idea-input">
          Your Startup Idea
        </label>
        <textarea
          id="idea-input"
          style={styles.textarea}
          placeholder="e.g. An AI-powered platform that matches freelancers with startups based on skill compatibility..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          disabled={loading}
        />
 
        {error && <p style={styles.errorText}>⚠️ {error}</p>}
 
        <button
          style={{
            ...styles.primaryBtn,
            opacity: loading || !idea.trim() ? 0.6 : 1,
            cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
          }}
          onClick={handleSubmit}
          disabled={loading || !idea.trim()}
        >
          {loading ? "⏳ Evaluating..." : "✨ Evaluate Idea"}
        </button>
      </section>
 
      {/* ── Results Section ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ── Charts Section ── */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>📊 Market Intelligence Insights</h2>
 
              <div style={styles.chartsGrid}>
                {/* Line Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={styles.chartContainer}
                >
                  <h3 style={styles.chartTitle}>📈 Market vs Competitors</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={marketGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="market" stroke="#0071e3" strokeWidth={2} />
                      <Line type="monotone" dataKey="competitor" stroke="#ef4444" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </motion.div>
 
                {/* Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={styles.chartContainer}
                >
                  <h3 style={styles.chartTitle}>💰 5-Year Revenue Projection</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueProjection}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
 
                {/* Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={styles.chartContainer}
                >
                  <h3 style={styles.chartTitle}>⚖️ SWOT Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={swotDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {swotDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </section>
 
            {/* ── Summary Cards ── */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>📋 Evaluation Report</h2>
              <p style={styles.ideaTag}>Idea: {result.idea}</p>
 
              <div style={styles.grid}>
                <ResultBlock
                  icon="📌"
                  title="Executive Summary"
                  content={result.executive_summary}
                  delay={0.4}
                />
                <ResultBlock
                  icon="📈"
                  title="Market Opportunity"
                  content={result.market_opportunity}
                  delay={0.5}
                />
                <ResultBlock
                  icon="🏆"
                  title="Competitor Analysis"
                  content={result.competitor_analysis}
                  delay={0.6}
                />
                <ResultBlock
                  icon="⚖️"
                  title="SWOT Analysis"
                  content={result.swot_analysis}
                  delay={0.7}
                />
                <ResultBlock
                  icon="💰"
                  title="Revenue Model"
                  content={result.revenue_model}
                  delay={0.8}
                />
                <ResultBlock
                  icon="🗓️"
                  title="Launch Plan"
                  content={result.launch_plan}
                  delay={0.9}
                />
              </div>
            </section>
 
            {/* ── Email Section ── */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>📧 Investor Pitch Email</h2>
              <p style={styles.helperText}>
                AI-generated follow-up email ready to send to investors.
              </p>
 
              <div style={styles.emailBox}>
                <pre style={styles.emailText}>{result.investor_pitch}</pre>
              </div>
 
              {/* ── Utility Buttons ── */}
              <div style={styles.buttonRow}>
                <button
                  style={{
                    ...styles.utilBtn,
                    ...styles.copyBtn,
                    backgroundColor: copySuccess ? "#16a34a" : "#2563eb",
                  }}
                  onClick={handleCopy}
                  title="Copy email to clipboard"
                >
                  {copySuccess ? "✅ Copied!" : "📋 Copy Email"}
                </button>
 
                <button
                  style={{
                    ...styles.utilBtn,
                    ...styles.regenBtn,
                    opacity: regenLoading ? 0.6 : 1,
                    cursor: regenLoading ? "not-allowed" : "pointer",
                  }}
                  onClick={handleRegenerate}
                  disabled={regenLoading}
                  title="Generate a new version"
                >
                  {regenLoading ? "⏳ Regenerating..." : "🔄 Regenerate"}
                </button>
 
                <button
                  style={{ ...styles.utilBtn, ...styles.clearBtn }}
                  onClick={handleClear}
                  title="Clear everything"
                >
                  🗑️ Clear All
                </button>
              </div>
 
              {copySuccess && (
                <div style={styles.copyBanner}>
                  ✅ Email copied to clipboard! Ready to paste into Gmail or Outlook.
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
function ResultBlock({
  icon,
  title,
  content,
  delay = 0,
}: {
  icon: string;
  title: string;
  content: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={styles.resultBlock}
    >
      <h3 style={styles.blockTitle}>
        {icon} {title}
      </h3>
      <p style={styles.blockContent}>{content}</p>
    </motion.div>
  );
}
 
// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "transparent",
    color: "#e2e8f0",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: "0",
  },
  headerSection: {
    textAlign: "center",
    paddingTop: "24px",
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "32px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    margin: "0 0 12px 0",
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    margin: "0",
  },
  card: {
    maxWidth: "860px",
    margin: "32px auto",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  textarea: {
    width: "100%",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    border: "1.5px solid #334155",
    borderRadius: "10px",
    padding: "14px 16px",
    fontSize: "1rem",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  errorText: {
    color: "#f87171",
    fontSize: "0.9rem",
    margin: "10px 0 0 0",
  },
  primaryBtn: {
    display: "block",
    width: "100%",
    marginTop: "20px",
    padding: "14px",
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#e2e8f0",
    margin: "0 0 20px 0",
  },
  ideaTag: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontStyle: "italic",
    margin: "0 0 24px 0",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "32px",
  },
  chartContainer: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #1e3a5f",
  },
  chartTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#60a5fa",
    margin: "0 0 16px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "16px",
  },
  resultBlock: {
    backgroundColor: "#0f172a",
    borderRadius: "10px",
    padding: "18px 20px",
    border: "1px solid #1e3a5f",
  },
  blockTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#60a5fa",
    margin: "0 0 10px 0",
  },
  blockContent: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  helperText: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: "0 0 16px 0",
  },
  emailBox: {
    backgroundColor: "#0f172a",
    border: "1.5px solid #334155",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "20px",
    overflowX: "auto" as const,
  },
  emailText: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#e2e8f0",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap" as const,
    fontFamily: "'Courier New', monospace",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap" as const,
  },
  utilBtn: {
    padding: "11px 22px",
    borderRadius: "8px",
    border: "none",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s, background 0.2s",
    color: "#fff",
  },
  copyBtn: {
    backgroundColor: "#2563eb",
  },
  regenBtn: {
    backgroundColor: "#7c3aed",
  },
  clearBtn: {
    backgroundColor: "#dc2626",
  },
  copyBanner: {
    marginTop: "14px",
    padding: "10px 16px",
    backgroundColor: "#14532d",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#86efac",
    border: "1px solid #16a34a",
  },
};
