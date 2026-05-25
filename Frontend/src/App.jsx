// import { useState } from 'react';
// import './App.css';
// import Editor from '@monaco-editor/react';
// import axios from 'axios';

// function App() {
//   const [code, setCode] = useState(`function App() {\n  return 1+1;\n}`);
//   const [reviewResult, setReviewResult] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   async function reviewCode() {
//     setError('');
//     setReviewResult('');
//     setLoading(true);

//     try {
//       const response = await axios.post('http://localhost:5000/ai/review', { code });
//       setReviewResult(response.data.review || 'No review returned.');
//     } catch (err) {
//       console.error('Review request failed:', err);
//       setError(err?.response?.data?.error || 'Unable to fetch review.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <main>
//         <div className='left'>
//           <div className="code">
//             <Editor
//               value={code}
//               onChange={(value) => setCode(value || '')}
//               language="javascript"
//               theme="vs-dark"
//               height="100%"
//               options={{
//                 fontSize: 14,
//                 minimap: { enabled: false },
//                 scrollBeyondLastLine: false,
//               }}
//             />
//           </div>
//           <button className="review" onClick={reviewCode} disabled={loading}>
//             {loading ? 'Reviewing…' : 'Review'}
//           </button>
//         </div>
//         <div className='right'>
//           <div className="ai">
//             {error && <div className="error">{error}</div>}
//             {!error && loading && <div>Loading review...</div>}
//             {!error && !loading && reviewResult && (
//               <pre>{reviewResult}</pre>
//             )}
//             {!error && !loading && !reviewResult && (
//               <div>Click Review to get AI feedback here.</div>
//             )}
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// export default App;

import { useState, useRef } from 'react';
import './App.css';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import Markdown from 'react-markdown';

function App() {
  const [code, setCode] = useState(`function App() {\n  return 1+1;\n}`);
  const [reviewResult, setReviewResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // ✅ width % में
  const isResizing = useRef(false);

  // ✅ Mouse drag logic
  function handleMouseDown() {
    isResizing.current = true;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e) {
    if (!isResizing.current) return;
    const totalWidth = window.innerWidth;
    const newLeftWidth = (e.clientX / totalWidth) * 100;

    // ✅ Min 20% Max 80% limit
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  }

  function handleMouseUp() {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }

  async function reviewCode() {
    setError('');
    setReviewResult('');
    setLoading(true);
    try {
      const response = await axios.post('https://code-review-v9sh.onrender.com', { code });
      setReviewResult(response.data.review || 'No review returned.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Unable to fetch review.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main>
        {/* Left Panel */}
        <div className='left' style={{ flexBasis: `${leftWidth}%` }}>
          <div className="code">
            <Editor
              value={code}
              onChange={(value) => setCode(value || '')}
              language="javascript"
              theme="vs-dark"
              height="100%"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
          <button className="review" onClick={reviewCode} disabled={loading}>
            {loading ? 'Reviewing…' : 'Review'}
          </button>
        </div>

        {/* ✅ Resizer Bar */}
        <div className="resizer" onMouseDown={handleMouseDown}></div>

        {/* Right Panel */}
        <div className='right' style={{ flexBasis: `${100 - leftWidth}%` }}>
          <div className="ai">
            {error && <div className="error">{error}</div>}
            {!error && loading && <div>Loading review...</div>}
            {!error && !loading && reviewResult && (
              <ReactMarkdown>{reviewResult}</ReactMarkdown>
            )}
            {!error && !loading && reviewResult && <pre>{reviewResult}</pre>}
            {!error && !loading && !reviewResult && <div>Click Review to get AI feedback here.</div>}
          </div>

        </div>
      </main>
    </>
  );
}

export default App;