'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GS3Page() {
  const router = useRouter()

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects')
        if (response.ok) {
          const subjects = await response.json()
          const gs3Subjects = subjects.filter((s: any) => s.category === 'GS3')
          if (gs3Subjects.length > 0) {
            router.replace(`/subjects/gs3`)
          } else {
            router.replace('/dashboard')
          }
        } else {
          router.replace('/dashboard')
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
        router.replace('/dashboard')
      }
    }

    fetchSubjects()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
    </div>
  )
}