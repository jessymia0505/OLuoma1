import React from 'react';
import { Send, Twitter, Globe, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-gradient-to-b from-transparent to-cyber-blue/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-display font-black mb-8 uppercase">Contact Us</h2>
        <p className="text-white/60 mb-12 max-w-xl mx-auto">
          Join the Verse Ecosystem. Stay updated with the latest racing protocols and community challenges.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a 
            href="https://t.me/Getverse" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass p-8 rounded-3xl flex items-center justify-between group hover:bg-cyber-blue/10 transition-all border-2 border-transparent hover:border-cyber-blue/50"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Send className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-2xl">Telegram</h3>
                <p className="text-white/50">@Getverse</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
              →
            </div>
          </a>

          <a 
            href="https://x.com/VerseEcosystem" 
            target="_blank" 
            rel="noopener noreferrer"
            className="glass p-8 rounded-3xl flex items-center justify-between group hover:bg-cyber-blue/10 transition-all border-2 border-transparent hover:border-cyber-blue/50"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Twitter className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-2xl">X (Twitter)</h3>
                <p className="text-white/50">@VerseEcosystem</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
              →
            </div>
          </a>
        </div>

        <div className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyber-blue" />
            <span className="font-display font-black text-xl tracking-tighter">VERSE</span>
          </div>
          
          <div className="flex gap-8 text-sm text-white/40 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Neural Safety</a>
          </div>

          <p className="text-xs text-white/20 font-mono">
            © 2026 VERSE_ECOSYSTEM. ALL_RIGHTS_RESERVED.
          </p>
        </div>
      </div>
    </section>
  );
}
