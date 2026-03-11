/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Zap, 
  Brain, 
  Utensils, 
  Gamepad2, 
  BookOpen, 
  Send,
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { getBabyResponse, BabyState } from './services/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [state, setState] = useState<BabyState>({
    name: "Nova",
    age: 0,
    happiness: 80,
    hunger: 20,
    intelligence: 10,
    personality: "Curious and bright"
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await getBabyResponse(userMsg, state, messages);
      setMessages(prev => [...prev, { role: 'model', text: response || "..." }]);
      
      // Natural growth
      setState(prev => ({
        ...prev,
        age: prev.age + 1,
        intelligence: Math.min(100, prev.intelligence + 1),
        happiness: Math.max(0, prev.happiness - 2),
        hunger: Math.min(100, prev.hunger + 3)
      }));
    } catch (error) {
      console.error("Failed to get response:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const performAction = (action: 'feed' | 'play' | 'teach') => {
    setState(prev => {
      switch (action) {
        case 'feed':
          return { ...prev, hunger: Math.max(0, prev.hunger - 30), happiness: Math.min(100, prev.happiness + 5) };
        case 'play':
          return { ...prev, happiness: Math.min(100, prev.happiness + 20), hunger: Math.min(100, prev.hunger + 10) };
        case 'teach':
          return { ...prev, intelligence: Math.min(100, prev.intelligence + 5), happiness: Math.max(0, prev.happiness - 5) };
        default:
          return prev;
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#e0d8d0] font-sans selection:bg-[#ff4e00]/30 overflow-hidden flex flex-col md:flex-row">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #3a1510 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #ff4e00 0%, transparent 70%)' }}
        />
      </div>

      {/* Sidebar: Stats & Controls */}
      <aside className="w-full md:w-80 p-6 z-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col gap-8 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ff4e00] flex items-center justify-center shadow-[0_0_20px_rgba(255,78,0,0.4)]">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{state.name}</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest">AI Entity • Cycle {state.age}</p>
          </div>
        </div>

        <div className="space-y-6">
          <StatBar label="Happiness" value={state.happiness} icon={<Heart className="w-3 h-3" />} color="bg-rose-500" />
          <StatBar label="Hunger" value={state.hunger} icon={<Utensils className="w-3 h-3" />} color="bg-amber-500" />
          <StatBar label="Intelligence" value={state.intelligence} icon={<Brain className="w-3 h-3" />} color="bg-indigo-500" />
        </div>

        <div className="grid grid-cols-1 gap-3 mt-auto">
          <ActionButton 
            onClick={() => performAction('feed')} 
            icon={<Utensils className="w-4 h-4" />} 
            label="Feed" 
            desc="Reduce hunger"
          />
          <ActionButton 
            onClick={() => performAction('play')} 
            icon={<Gamepad2 className="w-4 h-4" />} 
            label="Play" 
            desc="Boost happiness"
          />
          <ActionButton 
            onClick={() => performAction('teach')} 
            icon={<BookOpen className="w-4 h-4" />} 
            label="Teach" 
            desc="Increase IQ"
          />
        </div>
      </aside>

      {/* Main Content: Interaction Area */}
      <main className="flex-1 flex flex-col z-10 relative">
        {/* Baby Visualizer */}
        <div className="h-1/2 flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-64 h-64 rounded-full bg-gradient-to-br from-[#ff4e00]/20 to-transparent blur-3xl"
            />
          </div>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <BabyAvatar state={state} isTyping={isTyping} />
          </motion.div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md border-t border-white/10 mx-4 mb-4 rounded-3xl overflow-hidden shadow-2xl">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide mask-fade-edges"
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10 text-white/20 italic font-serif"
                >
                  Say hello to your new AI companion...
                </motion.div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-white/10 text-white border border-white/10' 
                      : 'bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20 font-serif italic text-base'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-[#ff4e00]/5 px-4 py-2 rounded-2xl flex gap-1 items-center">
                    <span className="w-1 h-1 bg-[#ff4e00] rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-[#ff4e00] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-[#ff4e00] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to Nova..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-[#ff4e00] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-edges {
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}

function StatBar({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-white/40 font-semibold">
        <span className="flex items-center gap-1.5">{icon} {label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        />
      </div>
    </div>
  );
}

function ActionButton({ onClick, icon, label, desc }: { onClick: () => void, icon: React.ReactNode, label: string, desc: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group text-left"
    >
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold text-white/80">{label}</div>
        <div className="text-[10px] text-white/30">{desc}</div>
      </div>
    </button>
  );
}

function BabyAvatar({ state, isTyping }: { state: BabyState, isTyping: boolean }) {
  // Visual evolves with intelligence and age
  const size = 120 + (state.intelligence / 2);
  const glowIntensity = state.happiness / 100;
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute w-full h-full rounded-full blur-2xl"
        style={{ backgroundColor: `rgba(255, 78, 0, ${0.2 * glowIntensity})` }}
      />
      
      {/* The "Baby" Core */}
      <motion.div 
        animate={{ 
          y: isTyping ? [0, -10, 0] : [0, -5, 0],
          scale: isTyping ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: isTyping ? 0.5 : 3, repeat: Infinity }}
        className="relative z-10 flex flex-col items-center"
      >
        <div 
          className="rounded-full bg-gradient-to-b from-white/20 to-white/5 border border-white/30 backdrop-blur-sm flex items-center justify-center relative overflow-hidden"
          style={{ width: size, height: size }}
        >
          {/* Internal Energy */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.2),transparent)]" />
          
          {/* Eyes */}
          <div className="flex gap-4">
            <Eye active={state.happiness > 40} />
            <Eye active={state.happiness > 40} />
          </div>

          {/* Mouth/Expression */}
          <div className="absolute bottom-1/4">
            {state.happiness > 70 ? (
              <div className="w-6 h-3 border-b-2 border-white/40 rounded-full" />
            ) : state.happiness < 30 ? (
              <div className="w-6 h-3 border-t-2 border-white/40 rounded-full" />
            ) : (
              <div className="w-4 h-0.5 bg-white/40 rounded-full" />
            )}
          </div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute -top-4 -right-4">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}

function Eye({ active }: { active: boolean }) {
  return (
    <div className="w-3 h-3 bg-white/80 rounded-full relative overflow-hidden flex items-center justify-center">
      <motion.div 
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
        className="absolute inset-0 bg-black/20"
      />
      <div className="w-1 h-1 bg-black/40 rounded-full" />
    </div>
  );
}
