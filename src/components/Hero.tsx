import React from 'react';
import { motion } from 'motion/react';
import { Zap, Sparkles, Trophy } from 'lucide-react';
import { sounds } from '../lib/sounds';

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const handleStart = () => {
    sounds.playStart();
    onStart();
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/20 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Zap className="w-10 h-10 text-cyber-purple" />
          <span className="px-4 py-1 glass rounded-full text-xs font-bold tracking-widest uppercase text-cyber-purple border-cyber-purple/50">
            Neural Grid Protocol v3.0
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-display font-black mb-6 tracking-tighter leading-none">
          VERSE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue neon-text-purple">
            SPEED RUN
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Drive Fast • Avoid Obstacles • Beat the Distance. <br />
          A high-octane endless racing challenge in the digital void.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(188, 19, 254, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="px-12 py-5 bg-cyber-purple text-white font-display font-black text-xl rounded-full neon-border-purple flex items-center gap-3"
          >
            START RACE
            <Zap className="w-5 h-5 fill-current" />
          </motion.button>
          
          <button 
            onClick={() => document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-12 py-5 glass hover:bg-white/10 text-white font-display font-bold text-xl rounded-full transition-all flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            LEADERBOARD
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase">Built by</span>
          <span className="text-sm font-display font-black tracking-widest text-cyber-blue neon-text-blue">@Oluoma05</span>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll to Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
}
