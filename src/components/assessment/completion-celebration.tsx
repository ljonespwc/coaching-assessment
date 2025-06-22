import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CompletionCelebrationProps {
  isComplete: boolean;
  onComplete?: () => void;
}

export default function CompletionCelebration({ isComplete, onComplete }: CompletionCelebrationProps) {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShowFireworks(true);
      const timer = setTimeout(() => {
        setShowFireworks(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  if (!showFireworks) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Fireworks */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + (i % 4) * 20}%`,
                top: `${20 + Math.floor(i / 4) * 20}%`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Additional colored particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className={`absolute w-3 h-3 rounded-full ${
                ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 4]
              }`}
              style={{
                left: `${30 + (i % 4) * 15}%`,
                top: `${30 + Math.floor(i / 4) * 15}%`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 0.8, 0],
                x: [0, (Math.random() - 0.5) * 300],
                y: [0, (Math.random() - 0.5) * 300],
              }}
              transition={{
                duration: 2.5,
                delay: 0.5 + i * 0.15,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Celebration message */}
        <motion.div
          className="text-center text-white z-10"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            🏆
          </motion.div>
          <h2 className="text-4xl font-bold mb-2">Congratulations!</h2>
          <p className="text-xl">You&apos;ve completed the assessment!</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
