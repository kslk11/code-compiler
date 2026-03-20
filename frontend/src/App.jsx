import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CodeEditor from "./components/Editor";
import problems from "./data/problems";

// ── Helper: uniform border via explicit longhands only ───────────────────────
// Use this wherever all 4 sides share the same width/style/color.
// Never use the `border` shorthand — React's style reconciler warns when
// shorthand and longhand properties for the same value are mixed on re-render.
const bAll = (width, style, color) => ({
  borderTopWidth: width,
  borderRightWidth: width,
  borderBottomWidth: width,
  borderLeftWidth: width,
  borderTopStyle: style,
  borderRightStyle: style,
  borderBottomStyle: style,
  borderLeftStyle: style,
  borderTopColor: color,
  borderRightColor: color,
  borderBottomColor: color,
  borderLeftColor: color,
});

// ── Icons ────────────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{
      transform: open ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
    }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const InputIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

// ── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_COLORS = {
  Easy:   { bg: "#0d3321", text: "#34d67a", border: "#1a5c37" },
  Medium: { bg: "#2d2200", text: "#f5a623", border: "#5c4500" },
  Hard:   { bg: "#2d0d0d", text: "#e74c3c", border: "#5c1a1a" },
};

const LANG_COLORS = {
  python:     "#3572A5",
  javascript: "#f1e05a",
  java:       "#b07219",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const [language, setLanguage]               = useState("python");
  const [code, setCode]                       = useState("");
  const [input, setInput]                     = useState("");
  const [output, setOutput]                   = useState("");
  const [activeTab, setActiveTab]             = useState("input");
  const [selectedProblem, setSelectedProblem] = useState(problems[0]);
  const [loading, setLoading]                 = useState(false);
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [execTime, setExecTime]               = useState(null);
  const [outputStatus, setOutputStatus]       = useState(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    setCode(selectedProblem.starter[language]);
  }, [selectedProblem, language]);

  const runCode = async () => {
    setLoading(true);
    setOutput("");
    setOutputStatus(null);
    setExecTime(null);
    startTimeRef.current = performance.now();

    try {
      const res = await axios.post("http://backend-container:5000/api/run", {
        code,
        language,
        input,
      });
      const elapsed = ((performance.now() - startTimeRef.current) / 1000).toFixed(2);
      setExecTime(elapsed);
      if (res.data.success) {
        setOutput(res.data.output);
        setOutputStatus("success");
      } else {
        setOutput(`${res.data.type}: ${res.data.error}`);
        setOutputStatus("error");
      }
    } catch {
      setOutput("Connection failed — is the server running?");
      setOutputStatus("error");
    }

    setActiveTab("output");
    setLoading(false);
  };

  const difficulty = selectedProblem.difficulty || "Medium";
  const diffStyle  = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.Medium;

  return (
    <div style={S.root}>

      {/* ── TOP NAV ──────────────────────────────────────── */}
      <div style={S.topNav}>
        <div style={S.navLeft}>
          <div style={S.logo}>
            <span style={S.logoBracket}>&lt;</span>
            <span style={S.logoText}>codelab</span>
            <span style={S.logoBracket}>/&gt;</span>
          </div>
          <div style={S.navDivider} />
          <span style={S.problemTitle}>{selectedProblem.title}</span>

          {/* Difficulty badge — all 4 sides set explicitly, no shorthand */}
          <span
            style={{
              ...S.diffBadge,
              background:        diffStyle.bg,
              color:             diffStyle.text,
              borderTopColor:    diffStyle.border,
              borderRightColor:  diffStyle.border,
              borderBottomColor: diffStyle.border,
              borderLeftColor:   diffStyle.border,
            }}
          >
            {difficulty}
          </span>
        </div>

        <div style={S.navRight}>
          <div style={S.langSelector}>
            {["python", "javascript", "java"].map((lang) => {
              const isActive    = language === lang;
              const accentColor = LANG_COLORS[lang];
              const borderColor = isActive ? accentColor + "44" : "#1e2130";
              return (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    ...S.langBtn,
                    background:        isActive ? "#1e1e2e" : "transparent",
                    color:             isActive ? accentColor : "#5a6278",
                    // All 4 colors set every render — no property ever "removed"
                    borderTopColor:    borderColor,
                    borderRightColor:  borderColor,
                    borderBottomColor: borderColor,
                    borderLeftColor:   borderColor,
                  }}
                >
                  <span
                    style={{
                      width: 7, height: 7,
                      borderRadius: "50%",
                      background: accentColor,
                      display: "inline-block",
                      marginRight: 6,
                      opacity: isActive ? 1 : 0.4,
                    }}
                  />
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              );
            })}
          </div>

          <button
            onClick={runCode}
            disabled={loading}
            style={{ ...S.runBtn, ...(loading ? S.runBtnLoading : {}) }}
          >
            {loading ? <span style={S.spinner} /> : <PlayIcon />}
            {loading ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────── */}
      <div style={S.main}>

        {/* LEFT PANEL */}
        <div style={{ ...S.leftPanel, width: sidebarOpen ? "380px" : "0px" }}>
          <div style={S.leftPanelInner}>

            <div style={S.sectionHeader}>
              <span style={S.sectionNum}>01</span>
              <span style={S.sectionLabel}>Description</span>
            </div>

            <div style={S.descriptionBox}>
              <p style={S.descriptionText}>{selectedProblem.description}</p>
            </div>

            {selectedProblem.examples?.map((ex, i) => (
              <div key={i} style={S.exampleBox}>
                <div style={S.exampleLabel}>Example {i + 1}</div>
                <div style={S.exampleRow}>
                  <span style={S.exLabel}>Input:</span>
                  <code style={S.exCode}>{ex.input}</code>
                </div>
                <div style={S.exampleRow}>
                  <span style={S.exLabel}>Output:</span>
                  <code style={S.exCode}>{ex.output}</code>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 28 }}>
              <div style={S.sectionHeader}>
                <span style={S.sectionNum}>02</span>
                <span style={S.sectionLabel}>Problems</span>
                <span style={S.problemCount}>{problems.length}</span>
              </div>

              <div style={S.problemList}>
                {problems.map((p, idx) => {
                  const isActive   = p.id === selectedProblem.id;
                  const pDiff      = p.difficulty || "Medium";
                  const pStyle     = DIFFICULTY_COLORS[pDiff] || DIFFICULTY_COLORS.Medium;
                  const bColor     = isActive ? "#232640" : "transparent";
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProblem(p)}
                      style={{
                        ...S.problemItem,
                        background:        isActive ? "#131628" : "transparent",
                        borderTopColor:    bColor,
                        borderRightColor:  bColor,
                        borderBottomColor: bColor,
                        borderLeftColor:   bColor,
                      }}
                    >
                      <span style={S.problemIdx}>{String(idx + 1).padStart(2, "0")}</span>
                      <span style={S.problemName}>{p.title}</span>
                      <span style={{ ...S.miniDiff, color: pStyle.text }}>{pDiff}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR TOGGLE */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={S.sidebarToggle}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronIcon open={sidebarOpen} />
        </button>

        {/* RIGHT PANEL */}
        <div style={S.rightPanel}>

          {/* EDITOR */}
          <div style={S.editorWrapper}>
            <div style={S.editorHeader}>
              <div style={S.editorFilename}>
                <span style={{ color: LANG_COLORS[language], marginRight: 6, fontSize: 11 }}>●</span>
                solution.{language === "python" ? "py" : language === "javascript" ? "js" : "java"}
              </div>
              <button
                onClick={() => setCode(selectedProblem.starter[language])}
                style={S.ghostBtn}
              >
                Reset
              </button>
            </div>
            <div style={S.editorBody}>
              <CodeEditor code={code} setCode={setCode} language={language} />
            </div>
          </div>

          {/* I/O PANEL */}
          <div style={S.ioPanel}>
            <div style={S.ioTabs}>
              {[
                { id: "input",  label: "Input",  Icon: InputIcon },
                { id: "output", label: "Output", Icon: TerminalIcon },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    ...S.ioTab,
                    background: activeTab === id ? "#131628" : "transparent",
                    color:      activeTab === id ? "#a0aec0" : "#4a5268",
                  }}
                >
                  <Icon />
                  <span>{label}</span>
                  {id === "output" && outputStatus && (
                    <span
                      style={{
                        ...S.statusDot,
                        background: outputStatus === "success" ? "#34d67a" : "#e74c3c",
                      }}
                    />
                  )}
                </button>
              ))}
              {execTime && <span style={S.execTime}>⏱ {execTime}s</span>}
            </div>

            <div style={S.ioContent}>
              {activeTab === "input" && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="stdin — one value per line"
                  style={S.ioTextarea}
                />
              )}
              {activeTab === "output" && (
                <pre
                  style={{
                    ...S.outputPre,
                    color:
                      outputStatus === "error"   ? "#e74c3c" :
                      outputStatus === "success" ? "#a8ff78" :
                      "#8892a4",
                  }}
                >
                  {output || (
                    <span style={{ color: "#3d4455" }}>
                      {"// Press Run Code to execute..."}
                    </span>
                  )}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3d4155; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
// INVARIANT: The `border` shorthand is NEVER used anywhere in this object.
// Every border is expressed as borderTop/Right/Bottom/LeftWidth/Style/Color.
// This prevents React's rerender warning about removing shorthand properties
// when conflicting longhand properties are set.
const S = {
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0d0f17",
    color: "#c9d1d9",
    fontFamily: "'Sora', sans-serif",
    overflow: "hidden",
  },

  topNav: {
    height: 52,
    background: "#090b11",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#1a1d28",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    flexShrink: 0,
    gap: 12,
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
  },
  logo: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  logoBracket: { color: "#7c6af7" },
  logoText:    { color: "#e2e8f0", margin: "0 1px" },
  navDivider:  { width: 1, height: 20, background: "#1e2130" },
  problemTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "#a0aab8",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 240,
  },

  // diffBadge: border width+style fixed here; color always set inline
  diffBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 4,
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderTopWidth: 1,    borderRightWidth: 1,
    borderBottomWidth: 1, borderLeftWidth: 1,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    // Colors omitted intentionally — always provided inline on every render
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  langSelector: { display: "flex", gap: 4 },

  // langBtn: border width+style fixed; color always set inline
  langBtn: {
    display: "flex",
    alignItems: "center",
    borderTopWidth: 1,    borderRightWidth: 1,
    borderBottomWidth: 1, borderLeftWidth: 1,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    // Colors omitted — always set inline
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.15s ease",
  },

  runBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "linear-gradient(135deg, #5b4fcf 0%, #7c6af7 100%)",
    color: "#fff",
    borderTopWidth: 0,    borderRightWidth: 0,
    borderBottomWidth: 0, borderLeftWidth: 0,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    borderTopColor: "transparent",    borderRightColor: "transparent",
    borderBottomColor: "transparent", borderLeftColor: "transparent",
    borderRadius: 7,
    padding: "7px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    boxShadow: "0 2px 12px #7c6af733",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  },
  runBtnLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  spinner: {
    display: "inline-block",
    width: 12,
    height: 12,
    borderTopWidth: 2,    borderRightWidth: 2,
    borderBottomWidth: 2, borderLeftWidth: 2,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    borderTopColor: "#fff",
    borderRightColor:  "rgba(255,255,255,0.2)",
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderLeftColor:   "rgba(255,255,255,0.2)",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  main: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
    position: "relative",
  },

  leftPanel: {
    transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
    overflow: "hidden",
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "#1a1d28",
  },
  leftPanelInner: {
    width: 380,
    height: "100%",
    overflowY: "auto",
    padding: "20px 18px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#3d4460",
    fontWeight: 600,
    letterSpacing: "0.08em",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#5a6278",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  problemCount: {
    background: "#1a1d28",
    color: "#5a6278",
    borderRadius: 4,
    padding: "1px 6px",
    fontSize: 10,
    fontFamily: "'JetBrains Mono', monospace",
    marginLeft: "auto",
  },

  descriptionBox: {
    background: "#0f111a",
    ...bAll("1px", "solid", "#1a1d28"),
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 1.75,
    color: "#8892a4",
    whiteSpace: "pre-line",
  },

  exampleBox: {
    background: "#0a0c13",
    borderTopWidth: 1,    borderRightWidth: 1,
    borderBottomWidth: 1, borderLeftWidth: 3,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    borderTopColor:    "#1a1d28",
    borderRightColor:  "#1a1d28",
    borderBottomColor: "#1a1d28",
    borderLeftColor:   "#2a2060",
    borderRadius: "0 6px 6px 0",
    padding: "10px 14px",
    marginBottom: 8,
    animation: "fadeIn 0.3s ease",
  },
  exampleLabel: {
    fontSize: 10,
    color: "#7c6af7",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 6,
  },
  exampleRow: {
    display: "flex",
    gap: 8,
    alignItems: "baseline",
    marginTop: 4,
  },
  exLabel: {
    fontSize: 11,
    color: "#4a5268",
    fontFamily: "'JetBrains Mono', monospace",
    minWidth: 44,
  },
  exCode: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: "#a8b8d0",
    background: "#141720",
    padding: "1px 6px",
    borderRadius: 3,
  },

  problemList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  // problemItem: width+style fixed; color always set inline
  problemItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 6,
    cursor: "pointer",
    borderTopWidth: 1,    borderRightWidth: 1,
    borderBottomWidth: 1, borderLeftWidth: 1,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    // Colors omitted — always set inline
    transition: "all 0.15s ease",
  },
  problemIdx: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#2a2d3d",
    minWidth: 20,
  },
  problemName: {
    fontSize: 13,
    color: "#8892a4",
    flex: 1,
  },
  miniDiff: {
    fontSize: 10,
    fontWeight: 600,
  },

  sidebarToggle: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 16,
    height: 40,
    background: "#1a1d28",
    borderTopWidth: 1,    borderRightWidth: 1,
    borderBottomWidth: 1, borderLeftWidth: 0,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    borderTopColor:    "#242740",
    borderRightColor:  "#242740",
    borderBottomColor: "#242740",
    borderLeftColor:   "transparent",
    borderRadius: "0 5px 5px 0",
    color: "#5a6278",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },

  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  editorWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#1a1d28",
  },
  editorHeader: {
    height: 36,
    background: "#090b11",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#141720",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    flexShrink: 0,
  },
  editorFilename: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: "#4a5268",
    display: "flex",
    alignItems: "center",
  },

  ghostBtn: {
    background: "transparent",
    ...bAll("1px", "solid", "#1e2130"),
    color: "#4a5268",
    borderRadius: 4,
    padding: "3px 9px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.15s ease",
  },
  editorBody: {
    flex: 1,
    overflow: "hidden",
  },

  ioPanel: {
    height: 180,
    display: "flex",
    flexDirection: "column",
    background: "#090b11",
    flexShrink: 0,
  },
  ioTabs: {
    display: "flex",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#141720",
    padding: "0 14px",
    gap: 2,
    height: 36,
    flexShrink: 0,
  },

  // ioTab has no border at all — background/color toggled inline only
  ioTab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 0,    borderRightWidth: 0,
    borderBottomWidth: 0, borderLeftWidth: 0,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    borderTopColor: "transparent",    borderRightColor: "transparent",
    borderBottomColor: "transparent", borderLeftColor: "transparent",
    fontSize: 12,
    fontWeight: 500,
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: 5,
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.15s ease",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    display: "inline-block",
    marginLeft: 2,
  },
  execTime: {
    marginLeft: "auto",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#3a4052",
  },
  ioContent: {
    flex: 1,
    overflow: "hidden",
    padding: "8px 14px",
  },

  ioTextarea: {
    width: "100%",
    height: "100%",
    background: "transparent",
    borderTopWidth: 0,    borderRightWidth: 0,
    borderBottomWidth: 0, borderLeftWidth: 0,
    borderTopStyle: "solid",    borderRightStyle: "solid",
    borderBottomStyle: "solid", borderLeftStyle: "solid",
    borderTopColor: "transparent",    borderRightColor: "transparent",
    borderBottomColor: "transparent", borderLeftColor: "transparent",
    outline: "none",
    color: "#8892a4",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    resize: "none",
    lineHeight: 1.6,
  },

  outputPre: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    height: "100%",
    overflow: "auto",
    animation: "fadeIn 0.25s ease",
  },
};