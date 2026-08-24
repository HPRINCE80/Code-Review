import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_URL = 'https://editor-o66f.onrender.com';

const languages = {
  'Auto Detect': 'plaintext',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  C: 'c',
  'C++': 'cpp',
  'C#': 'csharp',
  Go: 'go',
  PHP: 'php',
  HTML: 'html',
  CSS: 'css',
  SQL: 'sql',
};

function App() {
  const [code, setCode] = useState(`function App() {
  return 1+1;
}`);

  const [language, setLanguage] = useState('JavaScript');
  const [mode, setMode] = useState('review');
  const [reviewResult, setReviewResult] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  const isResizing = useRef(false);

  // =========================
  // RESPONSIVE BREAKPOINT
  // =========================

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handleChange = () => setIsDesktop(mq.matches);

    handleChange();
    mq.addEventListener('change', handleChange);

    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // =========================
  // RESIZER
  // =========================

  function handleMouseDown() {
    if (!isDesktop) return;
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function handleMouseMove(e) {
    if (!isResizing.current) return;

    const newLeftWidth = (e.clientX / window.innerWidth) * 100;

    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }

  function handleMouseUp() {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // =========================
  // REVIEW CODE
  // =========================

  async function reviewCode() {
    if (!code.trim()) {
      setError('Please enter some code first.');
      return;
    }

    setError('');
    setReviewResult('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/review`, {
        code,
        language,
      });

      setReviewResult(response.data.review || 'No review returned.');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Unable to fetch review.');
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // AI CHAT
  // =========================

  async function sendChat() {
    if (!chatMessage.trim()) return;

    setError('');
    setReviewResult('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: chatMessage,
        code,
        language,
      });

      setReviewResult(response.data.reply || 'No response returned.');
      setChatMessage('');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Unable to get AI response.');
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // ENTER KEY FOR CHAT
  // =========================

  function handleChatKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  }

  return (
    <main className="flex flex-col md:flex-row h-screen w-full min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* =================================
          LEFT PANEL
      ================================= */}

      <section
        className="flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-slate-800 h-[45vh] md:h-full"
        style={isDesktop ? { width: `${leftWidth}%` } : undefined}
      >
        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex flex-col leading-tight">
            <h1 className="text-sm sm:text-base font-semibold text-white">
              Code Review AI
            </h1>
            <span className="text-xs text-slate-400">
              AI Coding Assistant
            </span>
          </div>

          {/* LANGUAGE */}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 text-xs sm:text-sm text-white rounded-md border border-slate-700 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {Object.keys(languages).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* EDITOR */}

        <div className="flex-1 min-h-0">
          <Editor
            value={code}
            onChange={(value) => setCode(value || '')}
            language={languages[language]}
            theme="vs-dark"
            height="100%"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>

        {/* REVIEW BUTTON */}

        <button
          onClick={reviewCode}
          disabled={loading}
          className="m-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 text-white font-medium py-2.5 transition-colors"
        >
          {loading ? 'Reviewing...' : '🔍 Review Code'}
        </button>
      </section>

      {/* =================================
          RESIZER
      ================================= */}

      <div
        onMouseDown={handleMouseDown}
        className="hidden md:block w-1 shrink-0 cursor-col-resize bg-slate-800 hover:bg-indigo-500 transition-colors"
      />

      {/* =================================
          RIGHT PANEL
      ================================= */}

      <section
        className="flex flex-col min-w-0 flex-1 md:flex-none h-[55vh] md:h-full"
        style={isDesktop ? { width: `${100 - leftWidth}%` } : undefined}
      >
        <div className="flex flex-col h-full">
          {/* MODE TABS */}

          <div className="flex border-b border-slate-800 bg-slate-900/60">
            <button
              onClick={() => {
                setMode('review');
                setError('');
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === 'review'
                  ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔍 Code Review
            </button>

            <button
              onClick={() => {
                setMode('chat');
                setError('');
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === 'chat'
                  ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💬 AI Chat
            </button>
          </div>

          {/* =================================
              CONTENT
          ================================= */}

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3">
                {error}
              </div>
            )}

            {!error && loading && (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400 py-16">
                <div className="h-8 w-8 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}

            {!error && !loading && reviewResult && (
              <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                <ReactMarkdown>{reviewResult}</ReactMarkdown>
              </div>
            )}

            {!error && !loading && !reviewResult && (
              <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-400 py-16">
                <div className="text-4xl">🤖</div>

                <h2 className="text-white text-lg font-semibold">
                  {mode === 'review'
                    ? 'AI Code Review'
                    : 'AI Coding Assistant'}
                </h2>

                <p className="text-sm max-w-xs">
                  {mode === 'review'
                    ? 'Write your code and click Review Code to get AI feedback.'
                    : 'Ask anything about your code or programming.'}
                </p>
              </div>
            )}
          </div>

          {/* =================================
              CHAT INPUT
          ================================= */}

          {mode === 'chat' && (
            <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-900/60 p-3">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask AI about your code..."
                rows={3}
                className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                onClick={sendChat}
                disabled={loading || !chatMessage.trim()}
                className="self-end rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 text-white text-sm font-medium px-4 py-2 transition-colors"
              >
                {loading ? 'Sending...' : 'Send ➤'}
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;