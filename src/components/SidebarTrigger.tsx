'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SidebarTriggerProps {
  isVisible: boolean
}

export default function SidebarTrigger({ isVisible }: SidebarTriggerProps) {
  const [showHint, setShowHint] = useState(true)

  useEffect(() => {
    // Cache l'indice après 10 secondes
    const timer = setTimeout(() => {
      setShowHint(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && showHint && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none"
        >
          <div className="bg-black/80 backdrop-blur-md border border-neon-green/30 rounded-r-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-neon-green"
              >
                ←
              </motion.div>
              <span className="text-xs text-gray-300 whitespace-nowrap">
                Déplacez la souris ici pour la navigation
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
