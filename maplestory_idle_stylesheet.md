/* ==========================================================================
   MapleStory Idle — EXP Calculator & Progress Logger Stylesheet
   ========================================================================== */

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #0b0f19;
  color: #f8fafc;
  -webkit-font-smoothing: antialiased;
}

.font-mono-num {
  font-family: 'JetBrains Mono', monospace;
}

.glass-card {
  background: rgba(19, 27, 46, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.glass-card-amber {
  border-color: rgba(245, 158, 11, 0.25);
  box-shadow: 0 8px 32px 0 rgba(245, 158, 11, 0.1);
}

.glass-card-emerald {
  border-color: rgba(16, 185, 129, 0.25);
  box-shadow: 0 8px 32px 0 rgba(16, 185, 129, 0.1);
}

.glow-emerald {
  box-shadow: 0 0 25px -5px rgba(16, 185, 129, 0.25);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0b0f19;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

.chart-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dash 1.5s ease-out forwards;
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}