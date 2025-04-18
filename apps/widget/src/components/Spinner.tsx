import { squircle } from 'ldrs'
import { useEffect } from 'react'

export function Spinner({ size = 1 }: { size?: number }) {
  useEffect(() => {
    squircle.register()
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
