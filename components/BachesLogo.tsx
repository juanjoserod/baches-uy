'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

type BachesLogoSize = 'small' | 'medium' | 'large'

interface BachesLogoProps {
  size?: BachesLogoSize
  className?: string
}

const SIZE_STYLES: Record<BachesLogoSize, {
  img: string
}> = {
  small: {
    img: 'h-[88px] sm:h-[96px]',
  },
  medium: {
    img: 'h-[120px]',
  },
  large: {
    img: 'h-[180px]',
  },
}

export function BachesLogo({ size = 'medium', className = '' }: BachesLogoProps) {
  const [isShaking, setIsShaking] = useState(false)
  const currentSize = SIZE_STYLES[size]

  function handleLogoClick() {
    setIsShaking(true)
    window.setTimeout(() => setIsShaking(false), 600)
  }

  return (
    <motion.div
      onClick={handleLogoClick}
      className={`flex items-center cursor-pointer select-none ${className}`}
      aria-label="baches uy"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isShaking
          ? {
              y: [0, -10, 8, -6, 4, -2, 0],
              rotate: [0, -2, 2, -1, 1, 0],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
    >
      <motion.img
        src="/baches-wordmark.png"
        alt="Baches uy"
        className={`${currentSize.img} w-auto`}
        animate={
          isShaking
            ? {
                rotate: [0, 5, -5, 3, -3, 0],
              }
            : {}
        }
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  )
}
