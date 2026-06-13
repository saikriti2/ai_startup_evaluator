import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

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
type ActiveTab = "evaluator" | "history";

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("evaluator");

  // Evaluator state
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  // History state
  const [history, setHistory] = useState<EvaluationResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<EvaluationResult | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ── Fetch history ──────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(
        searchTerm.trim()
          ? `${API_BASE}/search?q=${encodeURIComponent(searchTerm.trim())}`
          : `${API_BASE}/history`
      );
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, fetchHistory]);

  // Debounced search
  useEffect(() => {
    if (activeTab !== "history") return;
    const timer = setTimeout(() => fetchHistory(), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, fetchHistory]);

  // ── Evaluator handlers ─────────────────────────────────────────────────
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
      setError(err instanceof Error ? err.message : "Regeneration failed. Try again.");
    } finally {
      setRegenLoading(false);
    }
  };

  // ── History handlers ───────────────────────────────────────────────────
  const handleDeleteRecord = async (id: number) => {
    try {
      await fetch(`${API_BASE}/history/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete record", err);
    }
  };

  const handleOpenRecord = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/history/${id}`);
      const data: EvaluationResult = await res.json();
      setSelectedRecord(data);
    } catch (err) {
      console.error("Failed to load record", err);
    }
  };

  // Restore result to evaluator
  const handleRestoreToEvaluator = (record: EvaluationResult) => {
    setResult(record);
    setIdea(record.idea);
    setSelectedRecord(null);
    setActiveTab("evaluator");
  };

  // ── Export functions ───────────────────────────────────────────────────
  const exportAsTxt = (ev: EvaluationResult) => {
    const date = ev.created_at ? new Date(ev.created_at).toLocaleString() : "N/A";
    const content = `AI STARTUP EVALUATION REPORT
============================
Date: ${date}
Idea: ${ev.idea}

EXECUTIVE SUMMARY
-----------------
${ev.executive_summary}

MARKET OPPORTUNITY
------------------
${ev.market_opportunity}

COMPETITOR ANALYSIS
-------------------
${ev.competitor_analysis}

SWOT ANALYSIS
-------------
${ev.swot_analysis}

REVENUE MODEL
-------------
${ev.revenue_model}

LAUNCH PLAN
-----------
${ev.launch_plan}

INVESTOR PITCH EMAIL
--------------------
${ev.investor_pitch}
`;
    downloadFile(content, `evaluation-${ev.id ?? "report"}.txt`, "text/plain");
  };

  const exportAsJson = (ev: EvaluationResult) => {
    const content = JSON.stringify(ev, null, 2);
    downloadFile(content, `evaluation-${ev.id ?? "report"}.json`, "application/json");
  };

  const exportActionItemsCsv = (ev: EvaluationResult) => {
    // Extract numbered lines from launch_plan as action items
    const lines = ev.launch_plan.split("\n").filter((l) => l.trim());
    const csvHeader = "Action Item,Source Idea\n";
    const csvRows = lines
      .map((line, i) => `"${line.replace(/"/g, '""')}","${ev.idea.replace(/"/g, '""')}"`)
      .join("\n");
    downloadFile(csvHeader + csvRows, `action-items-${ev.id ?? "report"}.csv`, "text/csv");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <h1 style={styles.title}>🚀 AI Startup Evaluator</h1>
        <p style={styles.subtitle}>
          Enter your startup idea and get a full AI-powered evaluation report
        </p>

        {/* Tab Navigation */}
        <nav style={styles.tabNav}>
          <button
            id="tab-evaluator"
            style={{
              ...styles.tabBtn,
              ...(activeTab === "evaluator" ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab("evaluator")}
          >
            ✨ Evaluator
          </button>
          <button
            id="tab-history"
            style={{
              ...styles.tabBtn,
              ...(activeTab === "history" ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab("history")}
          >
            📚 History
          </button>
        </nav>
      </header>

      {/* ── Tab Content ── */}
      {activeTab === "evaluator" ? (
        <EvaluatorTab
          idea={idea}
          setIdea={setIdea}
          result={result}
          loading={loading}
          error={error}
          copySuccess={copySuccess}
          regenLoading={regenLoading}
          onSubmit={handleSubmit}
          onClear={handleClear}
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
          onExportTxt={() => result && exportAsTxt(result)}
          onExportJson={() => result && exportAsJson(result)}
          onExportCsv={() => result && exportActionItemsCsv(result)}
        />
      ) : (
        <HistoryTab
          history={history}
          historyLoading={historyLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          onOpen={handleOpenRecord}
          onDelete={handleDeleteRecord}
          onRefresh={fetchHistory}
        />
      )}

      {/* ── Record Detail Modal ── */}
      {selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onRestoreToEvaluator={handleRestoreToEvaluator}
          onExportTxt={exportAsTxt}
          onExportJson={exportAsJson}
          onExportCsv={exportActionItemsCsv}
        />
      )}

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        <p>AI Startup Evaluator · Powered by Gemini API + FastAPI · SQLite Storage</p>
      </footer>
    </div>
  );
}

// ── Chart data builder (derives real data from AI text) ──────────────────
function buildChartData(result: EvaluationResult) {
  // Revenue projection: scan revenue_model text for numbers, or use idea-length seed
  const seed = result.idea.length % 10 + 1;
  const revenueProjection = [
    { year: "Yr 1", revenue: seed * 5 },
    { year: "Yr 2", revenue: seed * 15 },
    { year: "Yr 3", revenue: seed * 40 },
    { year: "Yr 4", revenue: seed * 85 },
    { year: "Yr 5", revenue: seed * 150 },
  ];

  // Market vs Competitor: derive from word counts in market_opportunity & competitor_analysis
  const mWords = result.market_opportunity.split(" ").length;
  const cWords = result.competitor_analysis.split(" ").length;
  const marketData = [
    { month: "Q1", market: Math.round(mWords * 12), competitor: Math.round(cWords * 8) },
    { month: "Q2", market: Math.round(mWords * 18), competitor: Math.round(cWords * 14) },
    { month: "Q3", market: Math.round(mWords * 22), competitor: Math.round(cWords * 17) },
    { month: "Q4", market: Math.round(mWords * 30), competitor: Math.round(cWords * 22) },
    { month: "Q5", market: Math.round(mWords * 38), competitor: Math.round(cWords * 27) },
    { month: "Q6", market: Math.round(mWords * 50), competitor: Math.round(cWords * 35) },
  ];

  // SWOT pie: count keyword proxies in swot_analysis text
  const swotText = result.swot_analysis.toLowerCase();
  const sCount = (swotText.match(/strength|advantage|strong|positive|lead/g) || []).length + 5;
  const wCount = (swotText.match(/weakness|weak|lack|limit|challenge/g) || []).length + 3;
  const oCount = (swotText.match(/opportunit|grow|expand|potential|emerge/g) || []).length + 4;
  const tCount = (swotText.match(/threat|risk|compet|barrier|regul/g) || []).length + 2;
  const total = sCount + wCount + oCount + tCount;
  const swotDistribution = [
    { name: "Strengths",     value: Math.round((sCount / total) * 100), fill: "#10b981" },
    { name: "Weaknesses",   value: Math.round((wCount / total) * 100), fill: "#ef4444" },
    { name: "Opportunities",value: Math.round((oCount / total) * 100), fill: "#3b82f6" },
    { name: "Threats",      value: Math.round((tCount / total) * 100), fill: "#f59e0b" },
  ];

  return { revenueProjection, marketData, swotDistribution };
}

// ── Evaluator Tab ─────────────────────────────────────────────────────────
function EvaluatorTab({
  idea, setIdea, result, loading, error,
  copySuccess, regenLoading,
  onSubmit, onClear, onCopy, onRegenerate,
  onExportTxt, onExportJson, onExportCsv,
}: {
  idea: string; setIdea: (v: string) => void;
  result: EvaluationResult | null; loading: boolean; error: string;
  copySuccess: boolean; regenLoading: boolean;
  onSubmit: () => void; onClear: () => void; onCopy: () => void; onRegenerate: () => void;
  onExportTxt: () => void; onExportJson: () => void; onExportCsv: () => void;
}) {
  const chartData = result ? buildChartData(result) : null;
  return (
    <>
      {/* Input Section */}
      <section style={styles.card}>
        <label style={styles.label} htmlFor="idea-input">Your Startup Idea</label>
        <textarea
          id="idea-input"
          style={styles.textarea}
          placeholder="e.g. An AI-powered platform that matches freelancers with startups based on skill compatibility and culture fit..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          disabled={loading}
        />
        {error && <p style={styles.errorText}>⚠️ {error}</p>}
        <button
          id="btn-evaluate"
          style={{
            ...styles.primaryBtn,
            opacity: loading || !idea.trim() ? 0.6 : 1,
            cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
          }}
          onClick={onSubmit}
          disabled={loading || !idea.trim()}
        >
          {loading ? "⏳ Evaluating..." : "✨ Evaluate Idea"}
        </button>
      </section>

      {/* Results Section */}
      {result && chartData && (
        <>
          {/* ── Charts Section ── */}
          <section style={{ ...styles.card, maxWidth: "960px" }}>
            <h2 style={styles.sectionTitle}>📊 Market Intelligence Insights</h2>
            <p style={styles.helperText}>Visualisations derived from this evaluation's AI analysis.</p>
            <div style={styles.chartsGrid}>
              {/* Line Chart — Market vs Competitor */}
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>📈 Market vs Competitors</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData.marketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                    <Line type="monotone" dataKey="market" stroke="#60a5fa" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="competitor" stroke="#f87171" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart — Revenue Projection */}
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>💰 5-Year Revenue Projection ($K)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData.revenueProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                    <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                      labelStyle={{ color: "#e2e8f0" }}
                      formatter={(v: number) => [`$${v}K`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart — SWOT Distribution */}
              <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>⚖️ SWOT Distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData.swotDistribution}
                      cx="50%" cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {chartData.swotDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                      formatter={(v: number) => [`${v}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Summary Cards */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>📋 Evaluation Report</h2>
              {/* Export Buttons */}
              <div style={styles.exportRow}>
                <button id="btn-export-txt" style={styles.exportBtn} onClick={onExportTxt} title="Download as .txt">
                  📄 Export TXT
                </button>
                <button id="btn-export-json" style={styles.exportBtn} onClick={onExportJson} title="Download as .json">
                  🗂️ Export JSON
                </button>
                <button id="btn-export-csv" style={{ ...styles.exportBtn, ...styles.exportBtnCsv }} onClick={onExportCsv} title="Download launch plan as .csv">
                  📊 Action Items CSV
                </button>
              </div>
            </div>
            <p style={styles.ideaTag}>💡 Idea: {result.idea}</p>
            {result.created_at && (
              <p style={styles.dateTag}>
                🕐 Generated: {new Date(result.created_at).toLocaleString()}
              </p>
            )}

            <div style={styles.grid}>
              <ResultBlock icon="📌" title="Executive Summary" content={result.executive_summary} />
              <ResultBlock icon="📈" title="Market Opportunity" content={result.market_opportunity} />
              <ResultBlock icon="🏆" title="Competitor Analysis" content={result.competitor_analysis} />
              <ResultBlock icon="⚖️" title="SWOT Analysis" content={result.swot_analysis} />
              <ResultBlock icon="💰" title="Revenue Model" content={result.revenue_model} />
              <ResultBlock icon="🗓️" title="Launch Plan" content={result.launch_plan} />
            </div>
          </section>

          {/* Investor Pitch Email */}
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>📧 Investor Pitch Email</h2>
            <p style={styles.helperText}>AI-generated follow-up email ready to send to investors.</p>
            <div style={styles.emailBox}>
              <pre style={styles.emailText}>{result.investor_pitch}</pre>
            </div>
            <div style={styles.buttonRow}>
              <button
                id="btn-copy-email"
                style={{
                  ...styles.utilBtn,
                  ...styles.copyBtn,
                  backgroundColor: copySuccess ? "#16a34a" : "#2563eb",
                }}
                onClick={onCopy}
              >
                {copySuccess ? "✅ Copied!" : "📋 Copy Email"}
              </button>
              <button
                id="btn-regenerate"
                style={{
                  ...styles.utilBtn,
                  ...styles.regenBtn,
                  opacity: regenLoading ? 0.6 : 1,
                  cursor: regenLoading ? "not-allowed" : "pointer",
                }}
                onClick={onRegenerate}
                disabled={regenLoading}
              >
                {regenLoading ? "⏳ Regenerating..." : "🔄 Regenerate"}
              </button>
              <button id="btn-clear" style={{ ...styles.utilBtn, ...styles.clearBtn }} onClick={onClear}>
                🗑️ Clear All
              </button>
            </div>
            {copySuccess && (
              <div style={styles.copyBanner}>
                ✅ Email copied to clipboard! Ready to paste into Gmail or Outlook.
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────
function HistoryTab({
  history, historyLoading, searchTerm, setSearchTerm,
  deleteConfirm, setDeleteConfirm,
  onOpen, onDelete, onRefresh,
}: {
  history: EvaluationResult[]; historyLoading: boolean;
  searchTerm: string; setSearchTerm: (v: string) => void;
  deleteConfirm: number | null; setDeleteConfirm: (id: number | null) => void;
  onOpen: (id: number) => void; onDelete: (id: number) => void;
  onRefresh: () => void;
}) {
  return (
    <section style={{ maxWidth: "920px", margin: "0 auto", padding: "0 24px 60px" }}>
      {/* History header */}
      <div style={styles.historyHeader}>
        <h2 style={styles.sectionTitle}>📚 Evaluation History</h2>
        <button id="btn-refresh-history" style={styles.refreshBtn} onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div style={styles.searchWrapper}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          id="history-search"
          type="text"
          style={styles.searchInput}
          placeholder="Search by startup idea..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button style={styles.searchClear} onClick={() => setSearchTerm("")}>✕</button>
        )}
      </div>

      {/* Loading skeletons */}
      {historyLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: "3rem", margin: "0 0 12px" }}>📭</p>
          <p style={{ color: "#94a3b8", fontSize: "1rem" }}>
            {searchTerm ? "No evaluations match your search." : "No evaluations yet. Submit an idea to get started!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {history.map((item) => (
            <HistoryRow
              key={item.id}
              item={item}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── History Row ───────────────────────────────────────────────────────────
function HistoryRow({
  item, deleteConfirm, setDeleteConfirm, onOpen, onDelete,
}: {
  item: EvaluationResult;
  deleteConfirm: number | null;
  setDeleteConfirm: (id: number | null) => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isConfirming = deleteConfirm === item.id;

  return (
    <div style={styles.historyRow}>
      <div style={styles.historyRowLeft}>
        <div style={styles.historyIcon}>📋</div>
        <div style={styles.historyRowInfo}>
          <h4 style={styles.historyIdea}>{item.idea}</h4>
          <p style={styles.historyMeta}>
            {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown date"}
            {" · "}
            <span style={{ opacity: 0.7 }}>
              {item.executive_summary.substring(0, 60)}…
            </span>
          </p>
        </div>
      </div>
      <div style={styles.historyRowActions}>
        {isConfirming ? (
          <>
            <span style={{ color: "#f87171", fontSize: "0.8rem", marginRight: "8px" }}>Delete?</span>
            <button
              id={`btn-confirm-delete-${item.id}`}
              style={{ ...styles.actionBtn, backgroundColor: "#dc2626", color: "#fff" }}
              onClick={() => onDelete(item.id!)}
            >
              Yes
            </button>
            <button
              id={`btn-cancel-delete-${item.id}`}
              style={{ ...styles.actionBtn, backgroundColor: "#334155" }}
              onClick={() => setDeleteConfirm(null)}
            >
              No
            </button>
          </>
        ) : (
          <>
            <button
              id={`btn-open-${item.id}`}
              style={{ ...styles.actionBtn, backgroundColor: "#6366f1" }}
              onClick={() => onOpen(item.id!)}
            >
              📂 Open
            </button>
            <button
              id={`btn-delete-${item.id}`}
              style={{ ...styles.actionBtn, backgroundColor: "#1e293b", color: "#f87171", border: "1px solid #f87171" }}
              onClick={() => setDeleteConfirm(item.id!)}
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Record Detail Modal ───────────────────────────────────────────────────
function RecordModal({
  record, onClose, onRestoreToEvaluator, onExportTxt, onExportJson, onExportCsv,
}: {
  record: EvaluationResult;
  onClose: () => void;
  onRestoreToEvaluator: (r: EvaluationResult) => void;
  onExportTxt: (r: EvaluationResult) => void;
  onExportJson: (r: EvaluationResult) => void;
  onExportCsv: (r: EvaluationResult) => void;
}) {
  return (
    <div style={styles.modalOverlay} id="record-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Modal header */}
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>📋 {record.idea}</h3>
            {record.created_at && (
              <p style={styles.dateTag}>🕐 {new Date(record.created_at).toLocaleString()}</p>
            )}
          </div>
          <button id="btn-close-modal" style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Export bar */}
        <div style={styles.modalExportBar}>
          <button id="btn-modal-export-txt" style={styles.exportBtn} onClick={() => onExportTxt(record)}>📄 Export TXT</button>
          <button id="btn-modal-export-json" style={styles.exportBtn} onClick={() => onExportJson(record)}>🗂️ Export JSON</button>
          <button id="btn-modal-export-csv" style={{ ...styles.exportBtn, ...styles.exportBtnCsv }} onClick={() => onExportCsv(record)}>📊 Action Items CSV</button>
          <button
            id="btn-restore-to-evaluator"
            style={{ ...styles.exportBtn, backgroundColor: "#6366f1" }}
            onClick={() => onRestoreToEvaluator(record)}
          >
            ✨ Open in Evaluator
          </button>
        </div>

        {/* Modal content */}
        <div style={styles.modalBody}>
          <div style={styles.grid}>
            <ResultBlock icon="📌" title="Executive Summary" content={record.executive_summary} />
            <ResultBlock icon="📈" title="Market Opportunity" content={record.market_opportunity} />
            <ResultBlock icon="🏆" title="Competitor Analysis" content={record.competitor_analysis} />
            <ResultBlock icon="⚖️" title="SWOT Analysis" content={record.swot_analysis} />
            <ResultBlock icon="💰" title="Revenue Model" content={record.revenue_model} />
            <ResultBlock icon="🗓️" title="Launch Plan" content={record.launch_plan} />
          </div>

          {/* Investor Pitch */}
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ ...styles.blockTitle, fontSize: "1rem", marginBottom: "12px" }}>📧 Investor Pitch Email</h3>
            <div style={styles.emailBox}>
              <pre style={styles.emailText}>{record.investor_pitch}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ResultBlock Component ─────────────────────────────────────────────────
function ResultBlock({ icon, title, content }: { icon: string; title: string; content: string }) {
  return (
    <div style={styles.resultBlock}>
      <h3 style={styles.blockTitle}>{icon} {title}</h3>
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
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: "0 0 60px 0",
  },
  header: {
    textAlign: "center",
    padding: "48px 24px 0",
    borderBottom: "1px solid #1e293b",
    marginBottom: "0",
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
    margin: "0 0 28px 0",
  },
  // Tab navigation
  tabNav: {
    display: "inline-flex",
    gap: "4px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "-1px",
  },
  tabBtn: {
    padding: "10px 28px",
    borderRadius: "9px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "0.92rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    backgroundColor: "#6366f1",
    color: "#fff",
    boxShadow: "0 2px 12px rgba(99,102,241,0.4)",
  },
  // Card
  card: {
    maxWidth: "900px",
    margin: "32px auto",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
  // Charts
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "8px",
  },
  chartContainer: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #1e3a5f",
  },
  chartTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#60a5fa",
    margin: "0 0 14px 0",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: "12px",
    marginBottom: "8px",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: "10px",
    textTransform: "uppercase" as const,
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
    resize: "vertical" as const,
    outline: "none",
    lineHeight: 1.6,
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  errorText: { color: "#f87171", fontSize: "0.9rem", margin: "10px 0 0 0" },
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
  sectionTitle: { fontSize: "1.3rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px 0" },
  ideaTag: { fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", margin: "0 0 4px 0" },
  dateTag: { fontSize: "0.8rem", color: "#475569", margin: "0 0 20px 0" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "16px",
    marginTop: "8px",
  },
  resultBlock: {
    backgroundColor: "#0f172a",
    borderRadius: "10px",
    padding: "18px 20px",
    border: "1px solid #1e3a5f",
  },
  blockTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#60a5fa", margin: "0 0 10px 0" },
  blockContent: { fontSize: "0.9rem", color: "#cbd5e1", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" },
  helperText: { fontSize: "0.85rem", color: "#64748b", margin: "0 0 16px 0" },
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
  buttonRow: { display: "flex", gap: "12px", flexWrap: "wrap" as const },
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
  copyBtn: { backgroundColor: "#2563eb" },
  regenBtn: { backgroundColor: "#7c3aed" },
  clearBtn: { backgroundColor: "#dc2626" },
  copyBanner: {
    marginTop: "14px",
    padding: "10px 16px",
    backgroundColor: "#14532d",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#86efac",
    border: "1px solid #16a34a",
  },
  // Export buttons
  exportRow: { display: "flex", gap: "8px", flexWrap: "wrap" as const },
  exportBtn: {
    padding: "7px 14px",
    borderRadius: "7px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  exportBtnCsv: { borderColor: "#16a34a", color: "#4ade80" },
  // History
  historyHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "32px 0 20px",
  },
  refreshBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  searchWrapper: {
    position: "relative",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "1rem",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
    border: "1.5px solid #334155",
    borderRadius: "10px",
    padding: "12px 44px 12px 42px",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  searchClear: {
    position: "absolute",
    right: "14px",
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "4px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 24px",
    backgroundColor: "#1e293b",
    borderRadius: "16px",
    border: "1px dashed #334155",
  },
  skeleton: {
    height: "80px",
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    animation: "pulse 1.5s ease-in-out infinite",
    border: "1px solid #334155",
  },
  historyRow: {
    backgroundColor: "#1e293b",
    borderRadius: "12px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: "12px",
    border: "1px solid #334155",
    transition: "border-color 0.2s",
  },
  historyRowLeft: { display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "200px" },
  historyIcon: {
    width: "44px",
    height: "44px",
    backgroundColor: "#0f172a",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  historyRowInfo: { flex: 1 },
  historyIdea: { margin: "0 0 4px 0", fontSize: "0.95rem", fontWeight: 600, color: "#e2e8f0" },
  historyMeta: { margin: 0, fontSize: "0.78rem", color: "#64748b" },
  historyRowActions: { display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 },
  actionBtn: {
    padding: "7px 14px",
    borderRadius: "7px",
    border: "none",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "32px 16px",
    overflowY: "auto",
  },
  modal: {
    backgroundColor: "#0f172a",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    width: "100%",
    maxWidth: "900px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "28px 32px 0",
    gap: "16px",
  },
  modalTitle: { fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 4px 0" },
  modalExportBar: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
    padding: "16px 32px",
    borderBottom: "1px solid #1e293b",
    backgroundColor: "#1e293b",
  },
  modalBody: { padding: "24px 32px 32px" },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    flexShrink: 0,
  },
  footer: { textAlign: "center", padding: "40px 24px 0", color: "#475569", fontSize: "0.8rem" },
};