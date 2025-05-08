import { useEffect } from 'react'

import { ClientOnly } from './ClientOnly'

export function Spinner({ size = 1 }: { size?: number }) {
  return <ClientOnly>{() => <Squircle size={size} />}</ClientOnly>
}

function Squircle({ size }: { size: number }) {
  useEffect(() => {
    async function register() {
      const { squircle } = await import('ldrs')
      squircle.register()
    }
    void register()
  }, [])
  return (
    <l-squircle
      size={size * 40}
      stroke={4.0 * size}
      stroke-length='0.15'
      bg-opacity='0.1'
      speed='0.5'
      color='black'
    />
  )
}
