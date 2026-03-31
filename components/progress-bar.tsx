'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function ProgressBar() {
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setVisible(true)
    setWidth(30)
    
    const timer1 = setTimeout(() => setWidth(70), 200)
    const timer2 = setTimeout(() => setWidth(90), 400)
    const timer3 = setTimeout(() => {
      setWidth(100)
      setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 200)
    }, 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 z-50">
      <div 
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  )
}
