import React, { useState } from 'react';
import { Menu, Zap, User, X, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sounds } from '../lib/sounds';

interface NavbarProps {
  onMenuClick: () => void;
  username: string;
  onUsernameChange: (val: string) => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function Navbar({ 
  onMenuClick, 
  username, 
  onUsernameChange,
  showBackButton,
  onBackClick
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {showBackButton && (
            <button 
              onClick={onBackClick}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-cyber-purple group-hover:scale-110 transition-transform" />
              <span className="hidden sm:block font-display font-bold text-[10px] tracking-widest uppercase">BACK</span>
            </button>
          )}

          <button 
            onClick={toggleMute}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6 text-white/50" /> : <Volume2 className="w-6 h-6 text-white" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-cyber-purple fill-cyber-purple" />
          <span className="font-display font-black text-2xl tracking-tighter neon-text-purple">VERSE</span>
        </div>

        <button 
          onClick={() => setIsProfileOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:block text-[10px] font-bold tracking-widest text-white/50 uppercase">
            {username || 'SET_SIGNATURE'}
          </span>
          <User className="w-6 h-6 text-white" />
        </button>
      </nav>

      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass p-8 rounded-3xl border-2 border-cyber-purple neon-border-purple w-full max-w-md relative"
            >
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-display font-black mb-6 uppercase tracking-tight">NEURAL SIGNATURE</h3>
              
              <div className="mb-8">
                <label className="block text-[10px] text-white/50 uppercase mb-2 ml-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value.toUpperCase().slice(0, 15))}
                  placeholder="ENTER_NAME"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-display font-bold text-cyber-purple focus:outline-none focus:border-cyber-purple transition-all placeholder:text-white/10"
                />
              </div>

              <button 
                onClick={() => setIsProfileOpen(false)}
                className="w-full py-4 bg-white text-black font-display font-bold rounded-full hover:bg-white/90 transition-all"
              >
                SAVE & CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
