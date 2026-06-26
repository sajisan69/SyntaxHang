import React, { useState, useEffect, useCallback } from 'react';
import { wordBank } from './wordBank';
import keySound from './assets/keyboardSound.mp3';
import './App.css';

const THEMES = {
  blue: '#38bdf8',
  red: '#ef4444',
  yellow: '#eab308',
  green: '#4ade80'
};

const LEVEL_TIMERS = {
  beginner: 60,
  medium: 45,
  hard: 30
};

export default function App() {
  // --- STATE MANAGEMENT ---
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'won', 'lost'
  const [category, setCategory] = useState('english');
  const [difficulty, setDifficulty] = useState('beginner');
  
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Persistent State (Loaded from localStorage)
  const [diamonds, setDiamonds] = useState(0);
  const [score, setScore] = useState(0);
  const [activeTheme, setActiveTheme] = useState('blue');
  const [unlockedThemes, setUnlockedThemes] = useState(['blue']);

  // --- AUDIO ---
  const playClick = () => {
    const audio = new Audio(keySound);
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio play blocked by browser:", e));
  };

  // --- LOCAL STORAGE (Load on mount) ---
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('syntaxHangProfile'));
    if (savedData) {
      setDiamonds(savedData.diamonds || 0);
      setScore(savedData.score || 0);
      setActiveTheme(savedData.activeTheme || 'blue');
      setUnlockedThemes(savedData.unlockedThemes || ['blue']);
    }
  }, []);

  // --- LOCAL STORAGE (Save on change) ---
  useEffect(() => {
    const profile = { diamonds, score, activeTheme, unlockedThemes };
    localStorage.setItem('syntaxHangProfile', JSON.stringify(profile));
    
    // Update CSS Variable for dynamic theming
    document.documentElement.style.setProperty('--theme-color', THEMES[activeTheme]);
  }, [diamonds, score, activeTheme, unlockedThemes]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('lost');
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // --- GAME LOGIC ---
  const startGame = () => {
    const wordList = wordBank[category][difficulty];
    const randomWordObj = wordList[Math.floor(Math.random() * wordList.length)];
    
    setCurrentWord(randomWordObj.word.toUpperCase());
    setCurrentHint(randomWordObj.hint);
    setGuessedLetters([]);
    setMistakes(0);
    setTimeLeft(LEVEL_TIMERS[difficulty]);
    setGameState('playing');
  };

  const handleGuess = useCallback((letter) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) return;
    
    playClick();
    setGuessedLetters(prev => [...prev, letter]);

    if (!currentWord.includes(letter)) {
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= 6) setGameState('lost');
        return newMistakes;
      });
    } else {
      // Check win condition
      const isWin = currentWord.split('').every(char => 
        char === ' ' || guessedLetters.includes(char) || char === letter
      );
      if (isWin) {
        setGameState('won');
        setDiamonds(prev => prev + (difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 2));
        setScore(prev => prev + (difficulty === 'hard' ? 100 : difficulty === 'medium' ? 50 : 10));
      }
    }
  }, [currentWord, guessedLetters, gameState, difficulty]);

  // --- PHYSICAL KEYBOARD SUPPORT ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  // --- ECONOMY LOGIC ---
  const buyHint = () => {
    if (diamonds < 15 || gameState !== 'playing') return;
    const hiddenLetters = currentWord.split('').filter(char => !guessedLetters.includes(char) && char !== ' ');
    if (hiddenLetters.length === 0) return;
    
    setDiamonds(prev => prev - 15);
    const randomHiddenLetter = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
    handleGuess(randomHiddenLetter);
  };

  const buyTheme = (colorName, cost) => {
    if (unlockedThemes.includes(colorName)) {
      setActiveTheme(colorName);
    } else if (diamonds >= cost) {
      setDiamonds(prev => prev - cost);
      setUnlockedThemes(prev => [...prev, colorName]);
      setActiveTheme(colorName);
    }
  };

  // --- RENDER HELPERS ---
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const wordDisplay = currentWord.split('').map((char, index) => (
    <div key={index} className={`letter-box ${guessedLetters.includes(char) || gameState !== 'playing' ? 'revealed' : ''}`}>
      {guessedLetters.includes(char) || gameState !== 'playing' ? char : ''}
    </div>
  ));

  // --- SCREENS ---
  if (gameState === 'menu') {
    return (
      <div className="app-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <h1 className="app-title" style={{ fontSize: '3rem', marginBottom: '2rem' }}>SYNTAX<span className="title-accent">HANG</span></h1>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
            <div className="stat-badge"><span className="stat-label">DIAMONDS</span><span className="stat-value neon-blue">{diamonds} 💎</span></div>
            <div className="stat-badge"><span className="stat-label">HIGH SCORE</span><span className="stat-value neon-purple">{score}</span></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <select className="modern-input" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="english">English Words</option>
              <option value="developer">Developer Jargon</option>
              <option value="student">Student Life</option>
            </select>
            <select className="modern-input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="beginner">Beginner (60s)</option>
              <option value="medium">Medium (45s)</option>
              <option value="hard">Hard (30s)</option>
            </select>
          </div>

          <button className="glass-btn primary-btn large-btn" onClick={startGame}>START GAME</button>

          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ color: '#94a3b8', marginBottom: '1rem' }}>THEME SHOP</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {Object.keys(THEMES).map(theme => (
                <button 
                  key={theme} 
                  className="glass-btn"
                  style={{ background: THEMES[theme], color: '#000', opacity: activeTheme === theme ? 1 : 0.6 }}
                  onClick={() => buyTheme(theme, 50)}
                >
                  {unlockedThemes.includes(theme) ? (activeTheme === theme ? 'EQUIPPED' : 'EQUIP') : `BUY (50 💎)`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <div className="glass-header">
        <div className="stats-group">
          <div className="stat-badge"><span className="stat-label">LEVEL</span><span className="stat-value">{difficulty.toUpperCase()}</span></div>
          <div className="stat-badge"><span className="stat-label">DIAMONDS</span><span className="stat-value neon-blue">{diamonds} 💎</span></div>
          <div className="stat-badge"><span className="stat-label">SCORE</span><span className="stat-value neon-purple">{score}</span></div>
          <div className="stat-badge"><span className="stat-label">TIME</span><span className={`stat-value ${timeLeft <= 10 ? 'danger-text' : 'neon-green'}`}>{timeLeft}s</span></div>
        </div>
        <div className="app-title">SYNTAX<span className="title-accent" style={{color: 'var(--theme-color)'}}>HANG</span></div>
        <button className="glass-btn primary-btn" onClick={() => setGameState('menu')}>Quit</button>
      </div>

      {/* MAIN GAME */}
      <div className="game-grid">
        {/* LEFT PANEL */}
        <div className="left-panel glass-panel">
          <div className="visualizer-container">
            <svg className="neon-hangman" viewBox="0 0 200 250" style={{ filter: `drop-shadow(0 0 15px var(--theme-color))` }}>
              {/* Scaffold */}
              <line x1="20" y1="230" x2="100" y2="230" className="scaffold" />
              <line x1="60" y1="20" x2="60" y2="230" className="scaffold" />
              <line x1="60" y1="20" x2="140" y2="20" className="scaffold" />
              <line x1="140" y1="20" x2="140" y2="50" className="scaffold" />
              
              {/* Body Parts based on mistakes */}
              {mistakes >= 1 && <circle cx="140" cy="70" r="20" className="body-part head" style={{stroke: 'var(--theme-color)'}} />}
              {mistakes >= 2 && <line x1="140" y1="90" x2="140" y2="150" className="body-part" style={{stroke: 'var(--theme-color)'}} />}
              {mistakes >= 3 && <line x1="140" y1="110" x2="110" y2="140" className="body-part" style={{stroke: 'var(--theme-color)'}} />}
              {mistakes >= 4 && <line x1="140" y1="110" x2="170" y2="140" className="body-part" style={{stroke: 'var(--theme-color)'}} />}
              {mistakes >= 5 && <line x1="140" y1="150" x2="120" y2="190" className="body-part" style={{stroke: 'var(--theme-color)'}} />}
              {mistakes >= 6 && <line x1="140" y1="150" x2="160" y2="190" className="body-part" style={{stroke: 'var(--theme-color)'}} />}
            </svg>
          </div>
          <div className="mistake-counter">
            ERRORS: <span className={mistakes >= 5 ? 'danger-text' : 'neon-text'}>{mistakes} / 6</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="word-container glass-panel">
            {wordDisplay}
          </div>
          
          <div className="hint-banner glass-panel">
            <span className="hint-icon">💡</span>
            <span className="hint-text">{currentHint}</span>
          </div>

          {(gameState === 'won' || gameState === 'lost') ? (
            <div className="end-state-banner glass-panel" style={{ padding: '2rem' }}>
              <h2 className={gameState === 'won' ? 'win-text' : 'lose-text'} style={{ fontSize: '2rem' }}>
                {gameState === 'won' ? 'SYSTEM SECURED!' : 'SYSTEM CRASHED!'}
              </h2>
              <p>The word was: <strong>{currentWord}</strong></p>
              <button className="glass-btn primary-btn mt-4" onClick={startGame}>PLAY AGAIN</button>
            </div>
          ) : (
            <div className="keyboard-container glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="virtual-keyboard">
                {alphabets.map(letter => {
                  const isGuessed = guessedLetters.includes(letter);
                  const isCorrect = isGuessed && currentWord.includes(letter);
                  const isWrong = isGuessed && !currentWord.includes(letter);
                  
                  return (
                    <button 
                      key={letter}
                      disabled={isGuessed}
                      className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                      onClick={() => handleGuess(letter)}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
              
              {/* Small Reveal Button Underneath */}
              <button 
                className="glass-btn" 
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '0.4rem 1.2rem', 
                  fontSize: '0.85rem',
                  background: 'transparent', 
                  color: 'var(--theme-color)', 
                  border: '1px solid var(--theme-color)',
                  borderRadius: '20px',
                  opacity: diamonds >= 15 ? 1 : 0.5,
                  cursor: diamonds >= 15 ? 'pointer' : 'not-allowed'
                }}
                onClick={buyHint}
                disabled={diamonds < 15}
              >
                💡 Reveal Letter (15 💎)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}