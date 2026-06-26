import HomePage from '@/pages/HomePage'
import { useStore } from '@/stores/useStore'
import { useEffect } from 'react'

export default function App() {
  const loadInitialData = useStore((s) => s.loadInitialData)

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  return <HomePage />
}
