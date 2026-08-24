import { useState, useRef, useEffect } from 'react';
import './App.css';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [code, setCode] = useState(`function App() {
  return 1+1;
}`);

  const [reviewResult, setReviewResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [leftWidth, setLeftWidth] = useState(50);
  const isResizing = useRef(false);

  // Start resizing
  function handleMouseDown() {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  // Resize panels
  function handleMouseMove(e) {
    if (!isResizing.current) return;

    const totalWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / totalWidth) * 100;

    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }

  // Stop resizing
  function handleMouseUp() {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  // Add/remove resize listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  async function reviewCode() {
    setError('');
    setReviewResult('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://code-review-v9sh.onrender.com/ai/review',
        { code }
      );

      setReviewResult(
        response.data.review || 'No review returned.'
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
        'Unable to fetch review.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">

      {/* LEFT - CODE EDITOR */}
      <section
        className="left"
        style={{ '--left-width': `${leftWidth}%` }}
      >
        <div className="code">
          <Editor
            value={code}
            onChange={(value) => setCode(value || '')}
            language="javascript"
            theme="vs-dark"
            height="100%"
            options={{
              fontSize: 14,
              minimap: {
                enabled: false,
              },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
            }}
          />
        </div>

        <button
          className="review"
          onClick={reviewCode}
          disabled={loading}
        >
          {loading ? 'Reviewing…' : 'Review Code'}
        </button>
      </section>

      {/* DESKTOP RESIZER */}
      <div
        className="resizer"
        onMouseDown={handleMouseDown}
      />

      {/* RIGHT - AI REVIEW */}
      <section
        className="right"
        style={{ '--right-width': `${100 - leftWidth}%` }}
      >
        <div className="ai">

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {!error && loading && (
            <div className="loading">
              <div className="spinner"></div>
              <span>Analyzing your code...</span>
            </div>
          )}

          {!error && !loading && reviewResult && (
            <div className="markdown">
              <ReactMarkdown>
                {reviewResult}
              </ReactMarkdown>
            </div>
          )}

          {!error && !loading && !reviewResult && (
            <div className="empty">
              <div className="empty-icon">🤖</div>
              <h2>AI Code Review</h2>
              <p>
                Write your code and click
                <strong> Review Code </strong>
                to get AI feedback.
              </p>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default App;