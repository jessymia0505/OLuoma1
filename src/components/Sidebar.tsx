import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Home, Gamepad2, Trophy, Mail, Activity } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: Activity, external: true, url: 'https://analytics.vgdh.io' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-cyber-dark border-r border-white/10 z-[70] p-8"
          >
            <div className="flex justify-end mb-12">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {menuItems.map((item) => (
                item.external ? (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-cyber-purple/10 transition-colors group text-left"
                  >
                    <item.icon className="w-6 h-6 text-white/50 group-hover:text-cyber-purple transition-colors" />
                    <span className="font-display font-bold text-lg">{item.label}</span>
                  </a>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-cyber-purple/10 transition-colors group text-left"
                  >
                    <item.icon className="w-6 h-6 text-white/50 group-hover:text-cyber-purple transition-colors" />
                    <span className="font-display font-bold text-lg">{item.label}</span>
                  </button>
                )
              ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8 space-y-4">
              <div className="p-4 glass rounded-xl border-cyber-purple/30">
                <p className="text-xs text-white/50 uppercase mb-1">System Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-mono">NEURAL_LINK_ACTIVE</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Built by</p>
                <p className="text-xs font-display font-black text-cyber-blue tracking-widest">@Oluoma05</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
