import { useEffect } from 'react'

// User engagement tracking for PWA install criteria
export const useUserEngagement = () => {
  useEffect(() => {
    // Track session start
    if (!localStorage.getItem('session-start')) {
      localStorage.setItem('session-start', Date.now().toString())
    }

    // Track user interaction
    const trackEngagement = () => {
      localStorage.setItem('user-engaged', 'true')
      localStorage.setItem('last-interaction', Date.now().toString())
    }

    // Listen for user interactions
    const events = ['click', 'tap', 'touch', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, trackEngagement, { once: true })
    })

    // Track time spent (30 seconds minimum for install criteria)
    const timeSpentInterval = setInterval(() => {
      const sessionStart = parseInt(localStorage.getItem('session-start') || '0')
      const timeSpent = Date.now() - sessionStart
      
      if (timeSpent >= 30000) { // 30 seconds
        localStorage.setItem('engagement-time-met', 'true')
        clearInterval(timeSpentInterval)
      }
    }, 1000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackEngagement)
      })
      clearInterval(timeSpentInterval)
    }
  }, [])

  const isEngaged = localStorage.getItem('user-engaged') === 'true'
  const timeRequirementMet = localStorage.getItem('engagement-time-met') === 'true'
  
  return {
    isEngaged,
    timeRequirementMet,
    canShowInstallPrompt: isEngaged && timeRequirementMet
  }
}
