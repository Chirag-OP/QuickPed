import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Bike } from 'lucide-react';
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
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary flex items-center justify-center overflow-hidden">
      {/* Animated bikes in background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            initial={{ x: -100, y: Math.random() * 600 }}
            animate={{
              x: window.innerWidth + 100,
              y: Math.random() * 600,
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Bike size={60 + Math.random() * 40} />
          </motion.div>
        ))}
      </div>

      {/* Logo and text */}
      <div className="relative z-10 text-center px-6 max-w-xl">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            duration: 0.6
          }}
          className="mb-8 flex justify-center"
        >
          <div className="bg-white rounded-full p-8 shadow-2xl">
            <Bike size={80} className="text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl font-bold text-white mb-3"
        >
          Welcome to QuickPed
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xl text-white/90"
        >
          Campus mobility made easy with safe bike rentals, smart tracking, and centralized admin controls.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-10 flex justify-center"
        >
          <Button type="button" size="lg" onClick={onComplete} className="rounded-full px-10">
            Get Started
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12 flex gap-2 justify-center"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
