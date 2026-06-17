import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Bike, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 flex items-center justify-center overflow-hidden">
      {/* Premium Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[120px] rounded-full mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-300/20 blur-[150px] rounded-full mix-blend-overlay"></div>

        {/* Floating Mobility/Cycle Background Theme Components */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/5 drop-shadow-sm"
            initial={{ x: -150, y: Math.random() * 800 }}
            animate={{
              x: '110vw',
              y: [Math.random() * 800, Math.random() * 700, Math.random() * 800],
            }}
            transition={{
              duration: 12 + Math.random() * 6,
              delay: i * 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Bike size={80 + Math.random() * 60} strokeWidth={1.2} />
          </motion.div>
        ))}
      </div>

      {/* Main Glassmorphic Onboarding Container */}
      <div className="relative z-10 text-center px-6 max-w-xl w-full flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 25,
            duration: 0.8
          }}
          className="mb-8"
        >
          <div className="bg-white/15 backdrop-blur-2xl border border-white/25 rounded-[3rem] p-7 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative group">
            <div className="bg-white rounded-[2rem] p-7 shadow-inner relative overflow-hidden flex items-center justify-center min-w-[120px] min-h-[120px]">
              <div className="absolute -top-1 -right-1 p-2 text-amber-500/10">
                <Zap size={35} className="rotate-12" />
              </div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <Bike size={65} className="text-orange-500 relative z-10" strokeWidth={1.5} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Premium Typography & Titles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none drop-shadow-sm">
            Welcome to <span className="text-amber-200 relative inline-block">QuickPed</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/95 font-medium max-w-md mx-auto leading-relaxed drop-shadow-sm">
            Campus mobility made easy with smart electric rides and seamless rentals.
          </p>
        </motion.div>

        {/* Action Call to Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10"
        >
          <Button
            type="button"
            size="lg"
            onClick={onComplete}
            className="rounded-full px-10 h-14 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:scale-98 transition-all shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15)] text-lg font-bold flex items-center gap-2 group"
          >
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Step Pagination Carousel Dots - Inspired by image_91094d.png */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-14 flex gap-2 justify-center items-center"
        >
          <div className="w-6 h-2 bg-white rounded-full shadow-sm" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white/40 rounded-full shadow-sm" />
          ))}
        </motion.div>
      </div>
    </div>
  );
};