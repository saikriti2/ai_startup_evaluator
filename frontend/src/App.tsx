import { useState } from "react";
 
// ── Types ──────────────────────────────────────────────────────────────────
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
 
// ── Constants ──────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8000";
 
// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  // Email/Pitch section states
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
 
  // ── Handlers ──────────────────────────────────────────────────────────────
 
  // Submit idea to backend
  const handleSubmit = async () => {
    if (!idea.trim()) {
      setError("Please enter a startup idea before submitting.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: EvaluationResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to backend. Make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };
 
  // CLEAR — resets everything
  const handleClear = () => {
    setIdea("");
    setResult(null);
    setError("");
    setCopySuccess(false);
  };
 
  // COPY — copies investor pitch email to clipboard (Clipboard API)
  const handleCopy = async () => {
    if (!result?.investor_pitch) return;
    try {
      await navigator.clipboard.writeText(result.investor_pitch);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // Fallback for older browsers
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
 
  // REGENERATE — calls the API again with the same idea
  const handleRegenerate = async () => {
    if (!idea.trim()) return;
    setRegenLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: EvaluationResult = await res.json();
      setResult(data);
      setCopySuccess(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Regeneration failed. Try again."
      );
    } finally {
      setRegenLoading(false);
    }
  };
 
  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.title}>🚀 AI Startup Evaluator</h1>
        <p style={styles.subtitle}>
          Enter your startup idea and get a full AI-powered evaluation report
        </p>
      </header>
 
      {/* ── Input Section ── */}
      <section style={styles.card}>
        <label style={styles.label} htmlFor="idea-input">
          Your Startup Idea
        </label>
        <textarea
          id="idea-input"
          style={styles.textarea}
          placeholder="e.g. An AI-powered platform that matches freelancers with startups based on skill compatibility and culture fit..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          disabled={loading}
        />
 
        {/* Error message */}
        {error && <p style={styles.errorText}>⚠️ {error}</p>}
 
        {/* Submit button */}
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
      {result && (
        <>
          {/* Summary Cards */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>📋 Evaluation Report</h2>
            <p style={styles.ideaTag}>Idea: {result.idea}</p>
 
            <div style={styles.grid}>
              <ResultBlock
                icon="📌"
                title="Executive Summary"
                content={result.executive_summary}
              />
              <ResultBlock
                icon="📈"
                title="Market Opportunity"
                content={result.market_opportunity}
              />
              <ResultBlock
                icon="🏆"
                title="Competitor Analysis"
                content={result.competitor_analysis}
              />
              <ResultBlock
                icon="⚖️"
                title="SWOT Analysis"
                content={result.swot_analysis}
              />
              <ResultBlock
                icon="💰"
                title="Revenue Model"
                content={result.revenue_model}
              />
              <ResultBlock
                icon="🗓️"
                title="Launch Plan"
                content={result.launch_plan}
              />
            </div>
          </section>
 
          {/* ── Follow-up Email / Investor Pitch Section ── */}
          {/* THIS IS THE Week 2 Day 4 FEATURE: Email output + Copy/Clear/Regenerate buttons */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>📧 Investor Pitch Email</h2>
            <p style={styles.helperText}>
              AI-generated follow-up email ready to send to investors.
            </p>
 
            {/* Email output display box */}
            <div style={styles.emailBox}>
              <pre style={styles.emailText}>{result.investor_pitch}</pre>
            </div>
 
            {/* ── Utility Buttons (Clipboard API) ── */}
            <div style={styles.buttonRow}>
              {/* COPY BUTTON — uses Clipboard API */}
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
 
              {/* REGENERATE BUTTON — calls API again */}
              <button
                style={{
                  ...styles.utilBtn,
                  ...styles.regenBtn,
                  opacity: regenLoading ? 0.6 : 1,
                  cursor: regenLoading ? "not-allowed" : "pointer",
                }}
                onClick={handleRegenerate}
                disabled={regenLoading}
                title="Generate a new version of the email"
              >
                {regenLoading ? "⏳ Regenerating..." : "🔄 Regenerate"}
              </button>
 
              {/* CLEAR BUTTON — resets entire UI */}
              <button
                style={{ ...styles.utilBtn, ...styles.clearBtn }}
                onClick={handleClear}
                title="Clear everything and start over"
              >
                🗑️ Clear All
              </button>
            </div>
 
            {/* Copy feedback banner */}
            {copySuccess && (
              <div style={styles.copyBanner}>
                ✅ Email copied to clipboard! Ready to paste into Gmail or Outlook.
              </div>
            )}
          </section>
        </>
      )}
 
      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <p>AI Startup Evaluator · Powered by Gemini API + FastAPI</p>
      </footer>
    </div>
  );
}
 
// ── ResultBlock Component ─────────────────────────────────────────────────
function ResultBlock({
  icon,
  title,
  content,
}: {
  icon: string;
  title: string;
  content: string;
}) {
  return (
    <div style={styles.resultBlock}>
      <h3 style={styles.blockTitle}>
        {icon} {title}
      </h3>
      <p style={styles.blockContent}>{content}</p>
    </div>
  );
}
 
// ── Styles ────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: "0 0 60px 0",
  },
  header: {
    textAlign: "center",
    padding: "48px 24px 32px",
    borderBottom: "1px solid #1e293b",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: 800,
    margin: "0 0 12px 0",
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#94a3b8",
    margin: 0,
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
    margin: "0 0 8px 0",
  },
  ideaTag: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontStyle: "italic",
    margin: "0 0 24px 0",
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
  // Email output box
  emailBox: {
    backgroundColor: "#0f172a",
    border: "1.5px solid #334155",
    borderRadius: "10px",
    padding: "20px 24px",
    marginBottom: "20px",
    overflowX: "auto",
  },
  emailText: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#e2e8f0",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    fontFamily: "'Courier New', monospace",
  },
  // Button row for utility buttons
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
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
  footer: {
    textAlign: "center",
    padding: "32px 24px 0",
    color: "#475569",
    fontSize: "0.8rem",
  },
};
 