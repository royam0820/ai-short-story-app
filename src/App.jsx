import '@fontsource/source-serif-pro/400.css';
import '@fontsource/source-serif-pro/700.css';
import './styles/medium-style.css';

// ... rest of your imports

function App() {
  // ... existing component code ...

  return (
    <div className="app">
      <div className="input-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your story prompt..."
        />
        <button onClick={generateStory} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Story'}
        </button>
      </div>

      {loading && <div className="loading">Creating your story...</div>}

      {story && (
        <div className="story-container">
          <h1>{prompt}</h1>
          <div className="story-text">{story}</div>
        </div>
      )}
    </div>
  );
}

export default App; 