import { motion } from 'framer-motion'

const ORBS = [
  { size: 500, x: '5%', y: '15%', color: 'rgba(167, 139, 250, 0.06)', blur: 120 },
  { size: 400, x: '75%', y: '55%', color: 'rgba(96, 165, 250, 0.05)', blur: 100 },
  { size: 350, x: '55%', y: '5%', color: 'rgba(236, 72, 153, 0.04)', blur: 90 },
]

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 35, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
