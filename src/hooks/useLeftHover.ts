'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseLeftHoverOptions {
  triggerWidth?: number // Largeur de la zone de déclenchement en pixels
  delay?: number // Délai avant ouverture en ms
  closeDelay?: number // Délai avant fermeture en ms
}

export function useLeftHover({
  triggerWidth = 50,
  delay = 300,
  closeDelay = 500
}: UseLeftHoverOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const { clientX } = event
    
    // Si la souris est dans la zone de déclenchement à gauche
    if (clientX <= triggerWidth) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      
      if (!isOpen) {
        const newTimeoutId = setTimeout(() => {
          setIsOpen(true)
        }, delay)
        setTimeoutId(newTimeoutId)
      }
    } else if (clientX > triggerWidth + 320) { // 320px = largeur de la sidebar
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      
      if (isOpen) {
        // Fermeture plus rapide si la souris va loin vers la droite
        const fastCloseDelay = clientX > window.innerWidth * 0.6 ? 100 : closeDelay
        const newTimeoutId = setTimeout(() => {
          setIsOpen(false)
        }, fastCloseDelay)
        setTimeoutId(newTimeoutId)
      }
    } else if (clientX <= triggerWidth + 320 && isOpen) {
      // Zone de maintien - annule la fermeture si on est dans la sidebar
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
    }
  }, [triggerWidth, delay, closeDelay, isOpen, timeoutId])

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    
    const newTimeoutId = setTimeout(() => {
      setIsOpen(false)
    }, closeDelay)
    setTimeoutId(newTimeoutId)
  }, [closeDelay, timeoutId])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [handleMouseMove, handleMouseLeave, timeoutId])

  const closeSidebar = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsOpen(false)
  }, [timeoutId])

  return {
    isOpen,
    closeSidebar
  }
}
