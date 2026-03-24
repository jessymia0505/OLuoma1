import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, User, Zap, Star, Clock } from 'lucide-react';

interface Run {
  id: string;
  username?: string;
  distance: number;
  score: number;
  timestamp: string;
}

export default function Leaderboard() {
  const [recentRuns, setRecentRuns] = useState<Run[]>([]);

  const loadRuns = () => {
    const saved = localStorage.getItem('verse_speedrun_recent_runs');
    if (saved) {
      setRecentRuns(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadRuns();
    window.addEventListener('storage', loadRuns);
    return () => window.removeEventListener('storage', loadRuns);
  }, []);

  return (
    <section id="leaderboard" className="py-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-display font-black mb-4 uppercase tracking-tight">Current Racers</h2>
        <p className="text-white/40 mb-4">Real-time neural signatures from the grid</p>
        <div className="w-24 h-1 bg-gradient-to-r from-cyber-blue to-cyber-purple mx-auto rounded-full" />
      </div>

      <div className="space-y-4">
        {recentRuns.length > 0 ? (
          recentRuns.map((run, idx) => (
            <motion.div
              key={run.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-cyber-purple/50 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-xl ${
                  idx === 0 ? 'bg-cyber-purple text-white neon-border-purple' : 'bg-white/10 text-white'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    {run.username || `RACER_${run.id.slice(-4)}`}
                    {idx === 0 && <Star className="w-4 h-4 text-cyber-purple fill-cyber-purple" />}
                  </h3>
                  <p className="text-sm text-white/50 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-8 items-center">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-white/50 uppercase">Distance</p>
                  <p className="font-display font-bold text-lg">{run.distance.toLocaleString()}m</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/50 uppercase">Score</p>
                  <p className="font-display font-black text-2xl text-cyber-purple">{run.score.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
            <p className="text-white/30 font-display italic">No neural signatures detected. Start a race to upload yours.</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-8 glass rounded-3xl border-dashed border-white/20 text-center">
        <Zap className="w-12 h-12 text-cyber-purple mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-display font-bold mb-2 uppercase">MASTER THE GRID</h3>
        <p className="text-white/60 mb-6">Master the chaos and upload your neural signature to the global grid.</p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-8 py-3 bg-cyber-purple text-white rounded-full font-bold transition-all neon-border-purple"
        >
          START NEW RUN
        </button>
      </div>
    </section>
  );
}
