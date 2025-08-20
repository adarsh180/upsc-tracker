'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OptionalPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/subjects/optional')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
    </div>
  )
}