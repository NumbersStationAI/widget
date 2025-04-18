import { useEffect } from 'react'

const useScript = (url: string) => {
  useEffect(() => {
    const script = document.createElement('script')

    script.src = url
    script.async = true
    script.type = 'module'

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [url])
}

export default useScript
