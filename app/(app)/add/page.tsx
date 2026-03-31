'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AddModal from '@/components/add-modal'

export default function AddPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/feed') // Перенаправляем на feed после закрытия
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <>
      <AddModal open={true} onClose={handleClose} />
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
    </>
  )
}
