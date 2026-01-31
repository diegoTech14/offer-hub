"use client";

import { motion } from "framer-motion";

export function AnimatedWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Wave 1 - Back layer with gradient */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        animate={{
          x: [0, -80, 0, 80, 0],
          y: [0, 10, 0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          viewBox="0 0 1440 250"
          className="w-[160%] -ml-[30%]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave1Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(20, 154, 155, 0.08)" />
              <stop offset="50%" stopColor="rgba(20, 154, 155, 0.15)" />
              <stop offset="100%" stopColor="rgba(20, 154, 155, 0.08)" />
            </linearGradient>
          </defs>
          <path
            d="M0,120 C120,180 240,60 360,120 C480,180 600,60 720,120 C840,180 960,60 1080,120 C1200,180 1320,60 1440,100 L1440,250 L0,250 Z"
            fill="url(#wave1Gradient)"
          />
        </svg>
      </motion.div>

      {/* Wave 2 - Middle layer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        animate={{
          x: [0, 60, 0, -60, 0],
          y: [0, -8, 0, 8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      >
        <svg
          viewBox="0 0 1440 220"
          className="w-[160%] -ml-[30%]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave2Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(20, 154, 155, 0.12)" />
              <stop offset="50%" stopColor="rgba(20, 154, 155, 0.22)" />
              <stop offset="100%" stopColor="rgba(20, 154, 155, 0.12)" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C160,160 320,40 480,100 C640,160 800,40 960,100 C1120,160 1280,40 1440,80 L1440,220 L0,220 Z"
            fill="url(#wave2Gradient)"
          />
        </svg>
      </motion.div>

      {/* Wave 3 - Front layer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        animate={{
          x: [0, -50, 0, 50, 0],
          y: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      >
        <svg
          viewBox="0 0 1440 180"
          className="w-[160%] -ml-[30%]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave3Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(20, 154, 155, 0.15)" />
              <stop offset="50%" stopColor="rgba(20, 154, 155, 0.28)" />
              <stop offset="100%" stopColor="rgba(20, 154, 155, 0.15)" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 C140,130 280,30 420,80 C560,130 700,30 840,80 C980,130 1120,30 1260,80 C1350,110 1400,50 1440,70 L1440,180 L0,180 Z"
            fill="url(#wave3Gradient)"
          />
        </svg>
      </motion.div>
    </div>
  );
}
