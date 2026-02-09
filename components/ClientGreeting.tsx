'use client'

import { useEffect, useMemo, useState } from 'react'

type GreetingUser = {
  username?: string | null
  displayName?: string | null
}

function getGreetingByHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function ClientGreeting({ user }: { user?: GreetingUser | null }) {
  const name = useMemo(
    () => user?.displayName || user?.username || '',
    [user]
  )
  const [greeting, setGreeting] = useState<string>('Welcome')

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(getGreetingByHour(hour))
  }, [])

  if (!user) {
    return <span>Welcome</span>
  }

  return <span>{`${greeting}, ${name}`}</span>
}
