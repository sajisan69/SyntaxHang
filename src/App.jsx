import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { wordBank, CATEGORY_LABELS } from './wordBank';

/* =========================================================================
   SYNTAXHANG — a developer-themed Hangman game.
   Words live in wordBank.js, styles live in App.css — this file is JSX/logic
   only.
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. THEMES — now with rarity tiers, so the store reads like a real
      cosmetics shop instead of five flat color swatches.
   ------------------------------------------------------------------------- */
const RARITY_DEFS = {
  standard:  { label: 'Standard',  gradient: 'linear-gradient(135deg, #64748b, #475569)' },
  rare:      { label: 'Rare',      gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
  epic:      { label: 'Epic',      gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  legendary: { label: 'Legendary', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
};

const THEME_DEFS = {
  blue:   { color: '#38bdf8', name: 'Cyan Terminal',   tagline: 'The default IDE glow.',            cost: 0,   rarity: 'standard'  },
  green:  { color: '#4ade80', name: 'Success Build',   tagline: 'Zero errors, clean compile.',       cost: 50,  rarity: 'rare'      },
  yellow: { color: '#eab308', name: 'Compile Warning', tagline: 'Yellow squiggly-line energy.',      cost: 50,  rarity: 'rare'      },
  red:    { color: '#ef4444', name: 'Critical Error',  tagline: 'Stack trace red alert.',            cost: 90,  rarity: 'epic'      },
  purple: { color: '#a78bfa', name: 'Debug Mode',      tagline: 'Breakpoint hit. Step through.',     cost: 90,  rarity: 'epic'      },
  gold:   { color: '#fbbf24', name: 'Golden Compile',  tagline: 'Ship it. Zero warnings, ever.',     cost: 160, rarity: 'legendary' },
  void:   { color: '#f472b6', name: 'Void Runtime',    tagline: 'Undefined behavior, defined style.', cost: 140, rarity: 'legendary' },
};

const RARITY_ORDER = { standard: 0, rare: 1, epic: 2, legendary: 3 };

const LEVEL_TIMERS = { beginner: 60, medium: 45, hard: 30 };

// Characters that fall in the background "code rain" — letters (what you
// guess) mixed with a few real syntax symbols (what the theme is about).
const RAIN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ{}<>;=/*".split("");

// Win streak visual tiers — the flame badge escalates in color/animation
// intensity as the streak climbs, and the reward bonus scales alongside it.
function getStreakTier(streak) {
  if (streak >= 10) return 'legendary';
  if (streak >= 6) return 'hot';
  if (streak >= 3) return 'warm';
  if (streak >= 1) return 'spark';
  return 'none';
}

// Diamonds bonus for a win streak, capped so it doesn't run away forever.
function getStreakBonusDiamonds(newStreak) {
  return Math.min((newStreak - 1) * 2, 20);
}

/* -------------------------------------------------------------------------
   2. AUDIO — tiny synthesized click instead of an imported .mp3 file.
   ------------------------------------------------------------------------- */
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 620;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Audio not available in this environment — fail silently, game still works.
  }
}

/* -------------------------------------------------------------------------
   3. CODE RAIN — the landing page's signature element.
      Pure canvas + requestAnimationFrame, no external libs. The animation
      loop is set up once (color is read from a ref each frame) so switching
      themes no longer resets/flickers the whole rain field.
   ------------------------------------------------------------------------- */
function CodeRain({ color }) {
  const canvasRef = useRef(null);
  const dropsRef = useRef([]);
  const rafRef = useRef(null);
  const colorRef = useRef(color);

  useEffect(() => { colorRef.current = color; }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fontSize = 18;
    let columns = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      dropsRef.current = Array.from({ length: columns }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(9, 13, 22, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      dropsRef.current.forEach((y, i) => {
        const char = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
        const x = i * fontSize;
        ctx.fillStyle = colorRef.current;
        ctx.globalAlpha = 0.85;
        ctx.fillText(char, x, y * fontSize);
        ctx.globalAlpha = 1;

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        } else {
          dropsRef.current[i] += 0.5;
        }
      });
    };

    if (prefersReducedMotion) {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      draw();
      return () => window.removeEventListener('resize', resize);
    }

    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // run once — color changes are picked up via colorRef, no restart/flicker

  return <canvas ref={canvasRef} className="code-rain-canvas" />;
}

/* Mini hangman preview used inside the theme store cards */
const MiniHangman = ({ color }) => (
  <svg viewBox="0 0 200 250" style={{ width: '64px', height: '82px', filter: `drop-shadow(0 0 8px ${color})`, margin: '0 auto 10px' }}>
    <line x1="20" y1="230" x2="100" y2="230" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" />
    <line x1="60" y1="20" x2="60" y2="230" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" />
    <line x1="60" y1="20" x2="140" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" />
    <line x1="140" y1="20" x2="140" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round" />
    <circle cx="140" cy="70" r="20" fill="none" stroke={color} strokeWidth="6" />
    <line x1="140" y1="90" x2="140" y2="150" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="140" y1="110" x2="110" y2="140" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="140" y1="110" x2="170" y2="140" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="140" y1="150" x2="120" y2="190" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="140" y1="150" x2="160" y2="190" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

/* Shared quiz-setup form — used both in the multiplayer lobby and when the
   quizzer wants to start a fresh round after one just ended. */
function QuizSetupForm({ wordInput, setWordInput, hintInput, setHintInput, onRandom, onStart }) {
  return (
    <div className="quiz-setup-panel">
      <label className="mp-label">Set the word</label>
      <input
        className="modern-input"
        style={{ width: '100%', marginBottom: '0.8rem', textTransform: 'uppercase' }}
        placeholder="e.g. CLOSURE"
        value={wordInput}
        maxLength={16}
        onChange={e => setWordInput(e.target.value.replace(/[^a-zA-Z]/g, ''))}
      />
      <label className="mp-label">Give a hint</label>
      <input
        className="modern-input"
        style={{ width: '100%', marginBottom: '0.8rem' }}
        placeholder="A short clue for your friend"
        value={hintInput}
        maxLength={120}
        onChange={e => setHintInput(e.target.value)}
      />
      <button type="button" className="text-link quiz-random-btn" onClick={onRandom}>🎲 Suggest a random word</button>
      <button
        type="button"
        className="glass-btn primary-btn"
        style={{ width: '100%' }}
        onClick={onStart}
        disabled={!wordInput.trim() || !hintInput.trim()}
      >
        Start round
      </button>
    </div>
  );
}

/* =========================================================================
   MAIN APP
   ========================================================================= */
export default function App() {
  // --- core game state ---
  const [gameState, setGameState] = useState('menu'); // menu | playing | won | lost | mp-playing
  const [category, setCategory] = useState('developer');
  const [difficulty, setDifficulty] = useState('beginner');

  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- persistent / profile state ---
  const [diamonds, setDiamonds] = useState(40);
  const [score, setScore] = useState(0);
  const [activeTheme, setActiveTheme] = useState('blue');
  const [unlockedThemes, setUnlockedThemes] = useState(['blue']);

  // --- win streak tracking (solo mode) ---
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  // Snapshot of what happened at the end of the last round, used to show a
  // "streak bonus" / "flawless" / "streak ended" line on the result screen.
  const [lastRoundBonus, setLastRoundBonus] = useState(null);

  // --- UI / modal state ---
  const [showLogin, setShowLogin] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showThemeStore, setShowThemeStore] = useState(false);

  // --- multiplayer state (real, working — synced over BroadcastChannel) ---
  const bcSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;
  const bcRef = useRef(null);
  const mpMyRoleRef = useRef('quizzer');

  const [mpMode, setMpMode] = useState(null);              // null | 'host' | 'join'
  const [mpConnState, setMpConnState] = useState('idle');   // idle | hosting-wait | joining-wait | connected | error
  const [mpMyRole, setMpMyRole] = useState('quizzer');      // 'quizzer' | 'solver'
  const [mpOpponentConnected, setMpOpponentConnected] = useState(false);
  const [mpRoomCodeActual, setMpRoomCodeActual] = useState('');
  const [mpJoinInput, setMpJoinInput] = useState('');
  const [mpQuizWordInput, setMpQuizWordInput] = useState('');
  const [mpQuizHintInput, setMpQuizHintInput] = useState('');

  const [mpWord, setMpWord] = useState('');
  const [mpHint, setMpHint] = useState('');
  const [mpGuessed, setMpGuessed] = useState([]);
  const [mpMistakes, setMpMistakes] = useState(0);
  const [mpStatus, setMpStatus] = useState('waiting');      // waiting | playing | won | lost

  useEffect(() => { mpMyRoleRef.current = mpMyRole; }, [mpMyRole]);

  const themeColor = THEME_DEFS[activeTheme].color;

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [themeColor]);

  // --- solo game timer (fixed: single self-scheduling timeout instead of
  //     tearing down/rebuilding an interval every single tick) ---
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft <= 0) {
      setGameState('lost');
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [gameState, timeLeft]);

  const startGame = () => {
    const wordList = wordBank[category][difficulty];
    const randomWordObj = wordList[Math.floor(Math.random() * wordList.length)];
    setCurrentWord(randomWordObj.word.toUpperCase());
    setCurrentHint(randomWordObj.hint);
    setGuessedLetters([]);
    setMistakes(0);
    setTimeLeft(LEVEL_TIMERS[difficulty]);
    setLastRoundBonus(null);
    setGameState('playing');
  };

  const handleGuess = useCallback((letter) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter) || showLogin || showMultiplayer || showThemeStore) return;

    playClick();
    setGuessedLetters(prev => [...prev, letter]);

    if (!currentWord.includes(letter)) {
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= 6) {
          setGameState('lost');
          setLastRoundBonus({ result: 'lost', lostStreak: streak });
          setStreak(0);
        }
        return newMistakes;
      });
    } else {
      const isWin = currentWord.split('').every(char =>
        char === ' ' || guessedLetters.includes(char) || char === letter
      );
      if (isWin) {
        setGameState('won');

        const baseDiamonds = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 2;
        const baseScore = difficulty === 'hard' ? 100 : difficulty === 'medium' ? 50 : 10;
        const newStreak = streak + 1;
        const streakBonusDiamonds = getStreakBonusDiamonds(newStreak);
        const isFlawless = mistakes === 0;
        const flawlessBonusDiamonds = isFlawless ? 5 : 0;

        setStreak(newStreak);
        setBestStreak(prev => Math.max(prev, newStreak));
        setLastRoundBonus({ result: 'won', streak: newStreak, streakBonusDiamonds, isFlawless });
        setDiamonds(prev => prev + baseDiamonds + streakBonusDiamonds + flawlessBonusDiamonds);
        setScore(prev => prev + baseScore + streakBonusDiamonds * 5 + (isFlawless ? 25 : 0));
      }
    }
  }, [currentWord, guessedLetters, gameState, difficulty, mistakes, streak, showLogin, showMultiplayer, showThemeStore]);

  // --- multiplayer guess handler (solver is authoritative; broadcasts the
  //     resulting state so the quizzer's spectator view mirrors it live) ---
  const mpHandleGuess = useCallback((letter) => {
    if (mpStatus !== 'playing' || mpGuessed.includes(letter) || mpMyRole !== 'solver') return;

    playClick();
    const newGuessed = [...mpGuessed, letter];
    let newMistakes = mpMistakes;
    let newStatus = 'playing';

    if (!mpWord.includes(letter)) {
      newMistakes = mpMistakes + 1;
      if (newMistakes >= 6) newStatus = 'lost';
    } else {
      const isWin = mpWord.split('').every(ch => newGuessed.includes(ch));
      if (isWin) newStatus = 'won';
    }

    setMpGuessed(newGuessed);
    setMpMistakes(newMistakes);
    setMpStatus(newStatus);

    if (newStatus === 'won') {
      setDiamonds(prev => prev + 8);
      setScore(prev => prev + 60);
    }

    if (bcRef.current) {
      bcRef.current.postMessage({ type: 'guess-update', guessed: newGuessed, mistakes: newMistakes, status: newStatus });
    }
  }, [mpStatus, mpGuessed, mpMistakes, mpWord, mpMyRole]);

  // --- global keyboard support (bug fix: no longer fires letter guesses
  //     while the user is typing into a text input inside a modal) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const key = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;
      if (gameState === 'playing') handleGuess(key);
      else if (gameState === 'mp-playing') mpHandleGuess(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess, mpHandleGuess, gameState]);

  const buyHint = () => {
    if (diamonds < 15 || gameState !== 'playing') return;
    const hiddenLetters = currentWord.split('').filter(char => !guessedLetters.includes(char) && char !== ' ');
    if (hiddenLetters.length === 0) return;
    setDiamonds(prev => prev - 15);
    const randomHiddenLetter = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
    handleGuess(randomHiddenLetter);
  };

  const buyTheme = (key) => {
    const def = THEME_DEFS[key];
    if (unlockedThemes.includes(key)) {
      setActiveTheme(key);
    } else if (diamonds >= def.cost) {
      setDiamonds(prev => prev - def.cost);
      setUnlockedThemes(prev => [...prev, key]);
      setActiveTheme(key);
    }
  };

  /* ----------------------------- MULTIPLAYER (real) ----------------------------- */
  const generateRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const handleMpMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'join': {
        // Only the host receives this. Reply so the guest learns their role.
        if (bcRef.current) {
          bcRef.current.postMessage({ type: 'joined-ack', hostRole: mpMyRoleRef.current });
        }
        setMpOpponentConnected(true);
        setMpConnState('connected');
        break;
      }
      case 'joined-ack': {
        const myRole = msg.hostRole === 'quizzer' ? 'solver' : 'quizzer';
        setMpMyRole(myRole);
        mpMyRoleRef.current = myRole;
        setMpOpponentConnected(true);
        setMpConnState('connected');
        break;
      }
      case 'round-start': {
        setMpWord(msg.word);
        setMpHint(msg.hint);
        setMpGuessed([]);
        setMpMistakes(0);
        setMpStatus('playing');
        setMpOpponentConnected(true);
        setGameState('mp-playing');
        setShowMultiplayer(false);
        break;
      }
      case 'guess-update': {
        setMpGuessed(msg.guessed);
        setMpMistakes(msg.mistakes);
        setMpStatus(msg.status);
        break;
      }
      case 'leave': {
        setMpOpponentConnected(false);
        break;
      }
      default:
        break;
    }
  }, []);

  const openChannel = (code) => {
    try {
      if (bcRef.current) bcRef.current.close();
      const bc = new BroadcastChannel(`syntaxhang-room-${code}`);
      bc.onmessage = (e) => handleMpMessage(e.data);
      bcRef.current = bc;
    } catch (err) {
      setMpConnState('error');
    }
  };

  useEffect(() => {
    // Clean up the channel if the whole app unmounts.
    return () => { if (bcRef.current) bcRef.current.close(); };
  }, []);

  const openMultiplayerModal = () => {
    if (mpConnState !== 'connected') setMpMode(null);
    setShowMultiplayer(true);
  };

  const hostRoom = (role) => {
    setMpMyRole(role);
    mpMyRoleRef.current = role;
    const code = generateRoomCode();
    setMpRoomCodeActual(code);
    openChannel(code);
    setMpConnState('hosting-wait');
  };

  const joinRoom = () => {
    const code = mpJoinInput.trim().toUpperCase();
    if (!code) return;
    setMpRoomCodeActual(code);
    openChannel(code);
    if (bcRef.current) bcRef.current.postMessage({ type: 'join' });
    setMpConnState('joining-wait');
  };

  const fillRandomMpWord = () => {
    const list = wordBank[category][difficulty];
    const pick = list[Math.floor(Math.random() * list.length)];
    setMpQuizWordInput(pick.word.toUpperCase());
    setMpQuizHintInput(pick.hint);
  };

  const startMpRound = () => {
    const word = mpQuizWordInput.trim().toUpperCase();
    const hint = mpQuizHintInput.trim();
    if (!word || !hint) return;
    setMpWord(word);
    setMpHint(hint);
    setMpGuessed([]);
    setMpMistakes(0);
    setMpStatus('playing');
    setGameState('mp-playing');
    setShowMultiplayer(false);
    if (bcRef.current) bcRef.current.postMessage({ type: 'round-start', word, hint });
  };

  const leaveMultiplayer = () => {
    if (bcRef.current) {
      try { bcRef.current.postMessage({ type: 'leave' }); } catch (e) { /* channel already gone */ }
      bcRef.current.close();
      bcRef.current = null;
    }
    setMpMode(null);
    setMpConnState('idle');
    setMpOpponentConnected(false);
    setMpMyRole('quizzer');
    mpMyRoleRef.current = 'quizzer';
    setMpRoomCodeActual('');
    setMpJoinInput('');
    setMpQuizWordInput('');
    setMpQuizHintInput('');
    setMpWord('');
    setMpHint('');
    setMpGuessed([]);
    setMpMistakes(0);
    setMpStatus('waiting');
    setShowMultiplayer(false);
    setGameState('menu');
  };

  const closeMultiplayerModal = () => {
    // Only tear the connection down if we're mid-handshake; a live/connected
    // session should just hide behind the modal, not get killed.
    if (mpConnState === 'connected' || mpConnState === 'idle') {
      setShowMultiplayer(false);
    } else {
      leaveMultiplayer();
    }
  };

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const wordDisplay = currentWord.split('').map((char, index) => (
    <div key={index} className={`letter-box ${guessedLetters.includes(char) || gameState !== 'playing' ? 'revealed' : ''}`}>
      {guessedLetters.includes(char) || gameState !== 'playing' ? char : ''}
    </div>
  ));

  /* ----------------------------- MODALS ----------------------------- */
  const renderModals = () => (
    <>
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="glass-panel modal-box" onClick={e => e.stopPropagation()}>
            <span className="modal-eyebrow">// account.sync</span>
            <h2 className="modal-title">LINK ACCOUNT</h2>
            <p className="modal-sub">Enter a username and email to sync your progress across devices.</p>
            <input type="text" placeholder="Username..." className="modern-input" style={{ width: '100%', marginBottom: '1rem' }} />
            <input type="email" placeholder="Email address..." className="modern-input" style={{ width: '100%', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="glass-btn primary-btn" style={{ flex: 1 }} onClick={() => setShowLogin(false)}>Sync data</button>
              <button className="glass-btn ghost-btn" style={{ flex: 1 }} onClick={() => setShowLogin(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showMultiplayer && (
        <div className="modal-overlay" onClick={closeMultiplayerModal}>
          <div className="glass-panel modal-box" onClick={e => e.stopPropagation()}>
            <span className="modal-eyebrow">// multiplayer.session</span>
            <h2 className="modal-title">MULTIPLAYER</h2>

            {!bcSupported && (
              <p className="modal-sub">Your browser doesn't support realtime tab sync (BroadcastChannel). Try a recent Chrome, Edge, or Firefox.</p>
            )}

            {bcSupported && mpConnState === 'idle' && !mpMode && (
              <div className="mp-step">
                <label className="mp-label">1. How do you want to connect?</label>
                <div className="mp-choice-grid">
                  <button className="choice-card" onClick={() => setMpMode('host')}>
                    <span className="choice-icon">📡</span>
                    <span className="choice-title">Host a Room</span>
                    <span className="choice-desc">Create a code, share it with a friend</span>
                  </button>
                  <button className="choice-card" onClick={() => setMpMode('join')}>
                    <span className="choice-icon">🔗</span>
                    <span className="choice-title">Join a Room</span>
                    <span className="choice-desc">Enter a friend's room code</span>
                  </button>
                </div>
                <p className="mp-hint-note">Live sync works between two tabs or windows open in this browser — open SyntaxHang a second time to play with someone on this device.</p>
              </div>
            )}

            {bcSupported && mpMode === 'host' && mpConnState === 'idle' && (
              <div className="mp-step">
                <label className="mp-label">2. Choose your role</label>
                <div className="mp-choice-grid">
                  <button className={`choice-card ${mpMyRole === 'quizzer' ? 'selected' : ''}`} onClick={() => setMpMyRole('quizzer')}>
                    <span className="choice-icon">👑</span>
                    <span className="choice-title">Quizzer</span>
                    <span className="choice-desc">Pick the word, set the hint</span>
                  </button>
                  <button className={`choice-card ${mpMyRole === 'solver' ? 'selected' : ''}`} onClick={() => setMpMyRole('solver')}>
                    <span className="choice-icon">🧩</span>
                    <span className="choice-title">Solver</span>
                    <span className="choice-desc">Guess before you crash</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="glass-btn ghost-btn" style={{ flex: 1 }} onClick={() => setMpMode(null)}>Back</button>
                  <button className="glass-btn primary-btn" style={{ flex: 2 }} onClick={() => hostRoom(mpMyRole)}>Create room</button>
                </div>
              </div>
            )}

            {bcSupported && mpMode === 'join' && mpConnState === 'idle' && (
              <div className="mp-step">
                <label className="mp-label">2. Enter room code</label>
                <input
                  className="modern-input room-code-input"
                  value={mpJoinInput}
                  onChange={e => setMpJoinInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && joinRoom()}
                  placeholder="e.g. 7F3K2A"
                  maxLength={8}
                  style={{ width: '100%', marginBottom: '1.2rem' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="glass-btn ghost-btn" style={{ flex: 1 }} onClick={() => setMpMode(null)}>Back</button>
                  <button className="glass-btn primary-btn" style={{ flex: 2 }} onClick={joinRoom} disabled={!mpJoinInput.trim()}>Connect</button>
                </div>
              </div>
            )}

            {bcSupported && mpConnState === 'hosting-wait' && (
              <div className="mp-step mp-searching">
                <p className="mp-label" style={{ textAlign: 'center' }}>Share this code with your friend</p>
                <div className="room-code">{mpRoomCodeActual}</div>
                <div className="pulse-ring"><span className="pulse-icon">📡</span></div>
                <p className="mp-searching-text">Waiting for them to join…</p>
                <div className="typing-dots"><span /><span /><span /></div>
                <button className="glass-btn ghost-btn" style={{ marginTop: '1rem' }} onClick={leaveMultiplayer}>Cancel</button>
              </div>
            )}

            {bcSupported && mpConnState === 'joining-wait' && (
              <div className="mp-step mp-searching">
                <div className="pulse-ring"><span className="pulse-icon">🔗</span></div>
                <p className="mp-searching-text">Connecting to room {mpRoomCodeActual}…</p>
                <div className="typing-dots"><span /><span /><span /></div>
                <button className="glass-btn ghost-btn" style={{ marginTop: '1rem' }} onClick={leaveMultiplayer}>Cancel</button>
              </div>
            )}

            {bcSupported && mpConnState === 'error' && (
              <div className="mp-step">
                <p className="modal-sub">Couldn't open a connection channel. Please try again.</p>
                <button className="glass-btn ghost-btn" style={{ width: '100%' }} onClick={leaveMultiplayer}>Back</button>
              </div>
            )}

            {bcSupported && mpConnState === 'connected' && mpMyRole === 'quizzer' && (
              <div className="mp-step">
                <div className="conn-banner">
                  <span className="conn-status-dot connected" /> Connected — you are <strong style={{ color: 'var(--theme-color)' }}>Quizzer</strong>
                </div>
                <QuizSetupForm
                  wordInput={mpQuizWordInput}
                  setWordInput={setMpQuizWordInput}
                  hintInput={mpQuizHintInput}
                  setHintInput={setMpQuizHintInput}
                  onRandom={fillRandomMpWord}
                  onStart={startMpRound}
                />
              </div>
            )}

            {bcSupported && mpConnState === 'connected' && mpMyRole === 'solver' && (
              <div className="mp-step mp-searching">
                <div className="conn-banner">
                  <span className="conn-status-dot connected" /> Connected — you are <strong style={{ color: 'var(--theme-color)' }}>Solver</strong>
                </div>
                <p className="mp-searching-text">Waiting for the quizzer to set a word…</p>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            )}
          </div>
        </div>
      )}

      {showThemeStore && (
        <div className="modal-overlay" onClick={() => setShowThemeStore(false)}>
          <div className="glass-panel modal-box theme-store-box" onClick={e => e.stopPropagation()}>
            <div className="store-header">
              <div>
                <span className="modal-eyebrow">// theme.store</span>
                <h2 className="modal-title" style={{ marginBottom: 0 }}>THEME STORE</h2>
              </div>
              <div className="stat-badge">
                <span className="stat-label">BALANCE</span>
                <span className="stat-value neon-blue">{diamonds} 💎</span>
              </div>
            </div>

            <div className="theme-grid">
              {Object.entries(THEME_DEFS)
                .sort((a, b) => RARITY_ORDER[a[1].rarity] - RARITY_ORDER[b[1].rarity])
                .map(([key, def]) => {
                  const isEquipped = activeTheme === key;
                  const isUnlocked = unlockedThemes.includes(key);
                  return (
                    <div key={key} className={`theme-card ${def.rarity} ${isEquipped ? 'equipped' : ''}`} style={{ '--card-color': def.color }}>
                      <span className={`rarity-badge ${def.rarity}`}>{RARITY_DEFS[def.rarity].label}</span>
                      <MiniHangman color={def.color} />
                      <span className="theme-name">{def.name}</span>
                      <span className="theme-tagline">{def.tagline}</span>
                      <button
                        className="glass-btn theme-buy-btn"
                        style={{
                          background: isEquipped ? def.color : (isUnlocked ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.3)'),
                          color: isEquipped ? '#000' : 'white',
                          border: `1px solid ${isUnlocked ? (isEquipped ? 'transparent' : 'rgba(255,255,255,0.25)') : def.color}`
                        }}
                        onClick={() => buyTheme(key)}
                        disabled={!isUnlocked && diamonds < def.cost}
                      >
                        {isUnlocked ? (isEquipped ? 'EQUIPPED' : 'EQUIP') : `BUY · ${def.cost} 💎`}
                      </button>
                    </div>
                  );
                })}
            </div>

            <button className="glass-btn ghost-btn" style={{ width: '100%' }} onClick={() => setShowThemeStore(false)}>Close store</button>
          </div>
        </div>
      )}
    </>
  );

  /* ----------------------------- LANDING PAGE ----------------------------- */
  if (gameState === 'menu') {
    return (
      <div className="app-wrapper landing-wrapper">
        <CodeRain color={themeColor} />

        <div className="landing-nav">
          <button className="glass-btn ghost-btn" onClick={() => setShowLogin(true)}>👤 Login / Sync</button>
        </div>

        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            <span className="terminal-filename">syntaxhang.exe</span>
          </div>

          <div className="terminal-body">
            <h1 className="app-title landing-title">
              SYNTAX<span className="title-accent">HANG</span>
            </h1>
            <p className="landing-subtitle">
              Guess the word, letter by letter — <span style={{ color: 'var(--theme-color)' }}>before the system crashes.</span>
            </p>

            <div className="segmented-row">
              <div className="segmented-group">
                <label className="mp-label">Category</label>
                <div className="segmented-control">
                  {Object.keys(wordBank).map(c => (
                    <button key={c} className={`segment ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                      {CATEGORY_LABELS[c] || c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="segmented-group">
                <label className="mp-label">Difficulty</label>
                <div className="segmented-control">
                  {['beginner', 'medium', 'hard'].map(d => (
                    <button key={d} className={`segment ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>
                      {d[0].toUpperCase() + d.slice(1)} · {LEVEL_TIMERS[d]}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="glass-btn primary-btn large-btn run-btn" onClick={startGame}>
              <span className="run-arrow">▸</span> RUN PROGRAM
            </button>

            {bestStreak > 0 && (
              <p className="best-streak-note">🔥 Best streak: <strong style={{ color: 'var(--theme-color)' }}>{bestStreak}</strong></p>
            )}

            <div className="landing-footer-links">
              <button className="text-link" onClick={() => setShowThemeStore(true)}>🎨 Theme store</button>
              <button className="text-link" onClick={openMultiplayerModal}>🎮 Multiplayer</button>
            </div>
          </div>
        </div>

        {renderModals()}
      </div>
    );
  }

  /* ----------------------------- MULTIPLAYER GAMEPLAY PAGE ----------------------------- */
  if (gameState === 'mp-playing') {
    const mpWordDisplay = mpWord.split('').map((char, index) => (
      <div key={index} className={`letter-box ${mpGuessed.includes(char) || mpStatus !== 'playing' ? 'revealed' : ''}`}>
        {mpGuessed.includes(char) || mpStatus !== 'playing' ? char : ''}
      </div>
    ));

    return (
      <div className="app-wrapper">
        <div className="glass-header">
          <div className="stats-group">
            <div className="stat-badge"><span className="stat-label">ROLE</span><span className="stat-value">{mpMyRole.toUpperCase()}</span></div>
            <div className="stat-badge"><span className="stat-label">ROOM</span><span className="stat-value neon-blue">{mpRoomCodeActual}</span></div>
            <div className="stat-badge">
              <span className="stat-label">STATUS</span>
              <span className="stat-value mp-status-value">
                <span className={`conn-status-dot ${mpOpponentConnected ? 'connected' : 'disconnected'}`} />
                {mpOpponentConnected ? 'Live' : 'Peer left'}
              </span>
            </div>
          </div>
          <div className="app-title">SYNTAX<span className="title-accent">HANG</span></div>
          <button className="glass-btn primary-btn" onClick={leaveMultiplayer}>Leave match</button>
        </div>

        <div className="game-grid">
          <div className="left-panel glass-panel">
            <div className="visualizer-container">
              <svg className="neon-hangman" viewBox="0 0 200 250">
                <line x1="20" y1="230" x2="100" y2="230" className="scaffold" />
                <line x1="60" y1="20" x2="60" y2="230" className="scaffold" />
                <line x1="60" y1="20" x2="140" y2="20" className="scaffold" />
                <line x1="140" y1="20" x2="140" y2="50" className="scaffold" />
                {mpMistakes >= 1 && <circle cx="140" cy="70" r="20" className="body-part head" />}
                {mpMistakes >= 2 && <line x1="140" y1="90" x2="140" y2="150" className="body-part" />}
                {mpMistakes >= 3 && <line x1="140" y1="110" x2="110" y2="140" className="body-part" />}
                {mpMistakes >= 4 && <line x1="140" y1="110" x2="170" y2="140" className="body-part" />}
                {mpMistakes >= 5 && <line x1="140" y1="150" x2="120" y2="190" className="body-part" />}
                {mpMistakes >= 6 && <line x1="140" y1="150" x2="160" y2="190" className="body-part" />}
              </svg>
            </div>
            <div className="mistake-counter">
              ERRORS: <span className={mpMistakes >= 5 ? 'danger-text' : 'neon-text'}>{mpMistakes} / 6</span>
            </div>
          </div>

          <div className="right-panel">
            <div className="word-container glass-panel">{mpWordDisplay}</div>

            <div className="hint-banner glass-panel">
              <span className="hint-icon">💡</span>
              <span className="hint-text">{mpHint}</span>
            </div>

            {(mpStatus === 'won' || mpStatus === 'lost') ? (
              <div className="end-state-banner glass-panel">
                <h2 className={mpStatus === 'won' ? 'win-text' : 'lose-text'}>
                  {mpStatus === 'won' ? 'SOLVER WINS!' : 'SYSTEM CRASHED!'}
                </h2>
                <p>The word was: <strong>{mpWord}</strong></p>
                {mpMyRole === 'quizzer' ? (
                  <div style={{ marginTop: '1.2rem', textAlign: 'left' }}>
                    <QuizSetupForm
                      wordInput={mpQuizWordInput}
                      setWordInput={setMpQuizWordInput}
                      hintInput={mpQuizHintInput}
                      setHintInput={setMpQuizHintInput}
                      onRandom={fillRandomMpWord}
                      onStart={startMpRound}
                    />
                  </div>
                ) : (
                  <p className="mp-searching-text" style={{ marginTop: '0.75rem' }}>Waiting for the quizzer to start another round…</p>
                )}
              </div>
            ) : mpMyRole === 'solver' ? (
              <div className="keyboard-container glass-panel">
                <div className="virtual-keyboard">
                  {alphabets.map(letter => {
                    const isGuessed = mpGuessed.includes(letter);
                    const isCorrect = isGuessed && mpWord.includes(letter);
                    const isWrong = isGuessed && !mpWord.includes(letter);
                    return (
                      <button
                        key={letter}
                        disabled={isGuessed}
                        className={`key-btn ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                        onClick={() => mpHandleGuess(letter)}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="keyboard-container glass-panel spectator-panel">
                <p className="mp-label" style={{ textAlign: 'center' }}>👀 Spectating — your friend is guessing</p>
                <p className="mp-searching-text">Letters tried: {mpGuessed.length ? mpGuessed.join(', ') : '—'}</p>
              </div>
            )}
          </div>
        </div>

        {renderModals()}
      </div>
    );
  }

  /* ----------------------------- SOLO GAMEPLAY PAGE ----------------------------- */
  return (
    <div className="app-wrapper">
      <div className="glass-header">
        <div className="stats-group">
          <div className="stat-badge"><span className="stat-label">LEVEL</span><span className="stat-value">{difficulty.toUpperCase()}</span></div>
          <div className="stat-badge"><span className="stat-label">DIAMONDS</span><span className="stat-value neon-blue">{diamonds} 💎</span></div>
          <div className="stat-badge"><span className="stat-label">SCORE</span><span className="stat-value neon-purple">{score}</span></div>
          <div className={`stat-badge streak-badge tier-${getStreakTier(streak)}`} title={`Best streak: ${bestStreak}`}>
            <span className="stat-label">STREAK</span>
            <span className="stat-value streak-value">🔥 {streak}</span>
          </div>
          <div className="stat-badge"><span className="stat-label">TIME</span><span className={`stat-value ${timeLeft <= 10 ? 'danger-text' : 'neon-green'}`}>{timeLeft}s</span></div>
        </div>
        <div className="app-title">SYNTAX<span className="title-accent">HANG</span></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="glass-btn ghost-btn" onClick={() => setShowThemeStore(true)}>🎨 Theme Store</button>
          <button className="glass-btn ghost-btn" onClick={openMultiplayerModal}>🎮 Multiplayer</button>
          <button className="glass-btn primary-btn" onClick={() => setGameState('menu')}>Quit</button>
        </div>
      </div>

      <div className="game-grid">
        <div className="left-panel glass-panel">
          <div className="visualizer-container">
            <svg className="neon-hangman" viewBox="0 0 200 250">
              <line x1="20" y1="230" x2="100" y2="230" className="scaffold" />
              <line x1="60" y1="20" x2="60" y2="230" className="scaffold" />
              <line x1="60" y1="20" x2="140" y2="20" className="scaffold" />
              <line x1="140" y1="20" x2="140" y2="50" className="scaffold" />
              {mistakes >= 1 && <circle cx="140" cy="70" r="20" className="body-part head" />}
              {mistakes >= 2 && <line x1="140" y1="90" x2="140" y2="150" className="body-part" />}
              {mistakes >= 3 && <line x1="140" y1="110" x2="110" y2="140" className="body-part" />}
              {mistakes >= 4 && <line x1="140" y1="110" x2="170" y2="140" className="body-part" />}
              {mistakes >= 5 && <line x1="140" y1="150" x2="120" y2="190" className="body-part" />}
              {mistakes >= 6 && <line x1="140" y1="150" x2="160" y2="190" className="body-part" />}
            </svg>
          </div>
          <div className="mistake-counter">
            ERRORS: <span className={mistakes >= 5 ? 'danger-text' : 'neon-text'}>{mistakes} / 6</span>
          </div>
        </div>

        <div className="right-panel">
          <div className="word-container glass-panel">{wordDisplay}</div>

          <div className="hint-banner glass-panel">
            <span className="hint-icon">💡</span>
            <span className="hint-text">{currentHint}</span>
          </div>

          {(gameState === 'won' || gameState === 'lost') ? (
            <div className="end-state-banner glass-panel">
              <h2 className={gameState === 'won' ? 'win-text' : 'lose-text'}>
                {gameState === 'won' ? 'SYSTEM SECURED!' : 'SYSTEM CRASHED!'}
              </h2>
              <p>The word was: <strong>{currentWord}</strong></p>

              {gameState === 'won' && lastRoundBonus && lastRoundBonus.result === 'won' && (
                <div className="round-bonus-row">
                  <span className={`streak-pill tier-${getStreakTier(lastRoundBonus.streak)}`}>🔥 {lastRoundBonus.streak}-win streak</span>
                  {lastRoundBonus.streakBonusDiamonds > 0 && (
                    <span className="bonus-pill">+{lastRoundBonus.streakBonusDiamonds} 💎 streak bonus</span>
                  )}
                  {lastRoundBonus.isFlawless && (
                    <span className="bonus-pill flawless-pill">✨ Flawless +5 💎</span>
                  )}
                </div>
              )}

              {gameState === 'lost' && lastRoundBonus && lastRoundBonus.result === 'lost' && lastRoundBonus.lostStreak > 0 && (
                <p className="streak-ended-note">Streak of {lastRoundBonus.lostStreak} ended — best is still {bestStreak} 🔥</p>
              )}

              <button className="glass-btn primary-btn mt-4" onClick={startGame}>PLAY AGAIN</button>
            </div>
          ) : (
            <div className="keyboard-container glass-panel">
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
              <button className="glass-btn hint-btn" onClick={buyHint} disabled={diamonds < 15}>
                💡 Reveal Letter (15 💎)
              </button>
            </div>
          )}
        </div>
      </div>

      {renderModals()}
    </div>
  );
}
