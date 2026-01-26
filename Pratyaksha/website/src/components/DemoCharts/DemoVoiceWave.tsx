import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'

interface DemoVoiceWaveProps {
  animate?: boolean
}

export function DemoVoiceWave({ animate = true }: DemoVoiceWaveProps) {
  // Sound wave bars configuration
  const bars = [
    { height: 20, delay: 0 },
    { height: 35, delay: 0.1 },
    { height: 50, delay: 0.2 },
    { height: 40, delay: 0.15 },
    { height: 25, delay: 0.25 },
    { height: 45, delay: 0.05 },
    { height: 30, delay: 0.2 },
    { height: 55, delay: 0.1 },
    { height: 35, delay: 0.15 },
    { height: 20, delay: 0.25 },
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
      {/* Microphone with pulsing ring */}
      <div className="relative">
        {/* Pulsing rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid #f97316',
            }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={animate ? {
              scale: [1, 1.5 + i * 0.3, 2 + i * 0.4],
              opacity: [0.6, 0.3, 0],
            } : {}}
            transition={{
              duration: 1.5,
              delay: i * 0.4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Mic icon container */}
        <motion.div
          className="relative w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(249,115,22,0.2)' }}
          animate={animate ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Mic className="w-7 h-7" style={{ color: '#f97316' }} />
        </motion.div>
      </div>

      {/* Sound wave visualization */}
      <div className="flex items-center justify-center gap-1 h-16">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full"
            style={{ backgroundColor: '#f97316' }}
            initial={{ height: 8 }}
            animate={animate ? {
              height: [8, bar.height, 12, bar.height * 0.7, 8],
              opacity: [0.4, 1, 0.6, 0.9, 0.4],
            } : { height: 8 }}
            transition={{
              duration: 1.2,
              delay: bar.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={animate ? { opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: '#f97316' }}
          animate={animate ? {
            opacity: [1, 0.3, 1],
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
        <span className="text-[10px] text-white/50">Listening...</span>
      </motion.div>
    </div>
  )
}
