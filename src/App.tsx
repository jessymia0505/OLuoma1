import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import Contact from './components/Contact';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'home' | 'game'>('home');
  const [username, setUsername] = useState(() => localStorage.getItem('verse_speedrun_username') || '');
  const [raceReport, setRaceReport] = useState<{ distance: number, coins: number } | null>(null);
  
  const gameRef = useRef<HTMLDivElement>(null);

  const handleStartGame = () => {
    setRaceReport(null);
    setView('game');
    setTimeout(() => {
      gameRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGameEnd = (distance: number, coins: number) => {
    setRaceReport({ distance, coins });
  };

  const handleSyncAndReturn = () => {
    if (!raceReport) return;

    // Save to local leaderboard
    const currentUsername = localStorage.getItem('verse_speedrun_username') || 'ANONYMOUS';
    const newRun = {
      id: Date.now().toString(),
      username: currentUsername,
      distance: raceReport.distance,
      score: raceReport.coins,
      timestamp: new Date().toISOString()
    };
    
    const existingRuns = JSON.parse(localStorage.getItem('verse_speedrun_recent_runs') || '[]');
    const updatedRuns = [newRun, ...existingRuns].slice(0, 10); // Keep top 10
    localStorage.setItem('verse_speedrun_recent_runs', JSON.stringify(updatedRuns));
    
    // Trigger storage event for Leaderboard component
    window.dispatchEvent(new Event('storage'));
    
    setRaceReport(null);
    setView('home');
  };

  const handleNavigate = (section: string) => {
    if (section === 'game') {
      setView('game');
      setTimeout(() => {
        gameRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (section === 'home') {
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-white selection:bg-cyber-purple selection:text-white">
      <Navbar 
        onMenuClick={() => setIsSidebarOpen(true)} 
        username={username}
        onUsernameChange={(val) => {
          setUsername(val);
          localStorage.setItem('verse_speedrun_username', val);
        }}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNavigate={handleNavigate}
      />

      <main>
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero onStart={handleStartGame} />
              <Leaderboard />
              <Contact />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-32 pb-24"
              ref={gameRef}
            >
              <div className="text-center mb-12 px-6 relative">
                <button 
                  onClick={() => setView('home')}
                  className="absolute left-6 top-0 flex items-center gap-2 text-white/50 hover:text-white transition-colors font-display font-bold text-xs uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK_TO_GRID
                </button>
                <h2 className="text-4xl md:text-6xl font-display font-black mb-4 neon-text-purple">
                  RACE ACTIVE
                </h2>
                <p className="text-white/50 max-w-xl mx-auto">
                  Switch lanes to avoid obstacles. Collect coins and powerups to survive. Use A/D or Arrows to move.
                </p>
              </div>
              
              <Game onGameEnd={handleGameEnd} />

              <AnimatePresence>
                {raceReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
                  >
                    <div className="glass p-8 rounded-3xl border-2 border-cyber-purple neon-border-purple">
                      <h3 className="text-2xl font-display font-black mb-4 text-center">RACE RESULTS</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-white/50 uppercase">Distance</p>
                          <p className="text-2xl font-display font-bold text-cyber-blue">{raceReport.distance}m</p>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-white/50 uppercase">Coins</p>
                          <p className="text-2xl font-display font-bold text-yellow-400">{raceReport.coins}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-[10px] text-white/50 uppercase mb-2 ml-2">Neural Signature (Username)</label>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase().slice(0, 15);
                            setUsername(val);
                            localStorage.setItem('verse_speedrun_username', val);
                          }}
                          placeholder="ENTER_NAME"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-display font-bold text-cyber-purple focus:outline-none focus:border-cyber-purple transition-all placeholder:text-white/10"
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={handleSyncAndReturn}
                          className="w-full py-4 bg-white text-black font-display font-bold rounded-full hover:bg-white/90 transition-all"
                        >
                          SYNC DATA & RETURN
                        </button>
                        <button 
                          onClick={() => {
                            setRaceReport(null);
                            setView('home');
                          }}
                          className="w-full py-3 text-white/40 hover:text-white transition-all font-display font-bold text-xs uppercase tracking-widest"
                        >
                          DISCARD_RUN
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(0,242,255,0.1),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cyber-purple/5 to-transparent" />
      </div>
    </div>
  );
}
