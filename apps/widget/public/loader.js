function widgetApi() {
  return new Promise((resolve) => {
    let timeoutId

    const getApi = () => {
      const event = new Event('getWidgetApi')
      timeoutId = window.setTimeout(getApi, 1000)
      window.dispatchEvent(event)
    }

    const onWidgetApi = (e) => {
      const api = e.detail
      window.clearTimeout(timeoutId)
      resolve(api)
    }

    window.addEventListener('widgetApi', onWidgetApi, { once: true })
    getApi()
  })
}

const WIDGET_ANIMATION = '0.2s ease-in'
const BUTTON_ANIMATION = '0.15s ease-in'
const NUMBERS_STATION_ICON_SVG = `<svg width="37" height="36" viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.00682 7.30426C4.00576 5.05988 6.83821 4.01597 8.33903 5.70759L15.8399 14.162C15.0276 10.1432 17.2726 6.02305 21.3045 4.5414C25.7845 2.89506 30.7743 5.12973 32.4495 9.53267C32.8837 10.6739 33.0529 11.8519 32.9858 12.9988L32.9932 28.6957C32.9942 30.9401 30.1618 31.984 28.661 30.2924L21.1601 21.838C21.9724 25.8568 19.7274 29.9769 15.6955 31.4586C11.2155 33.1049 6.2257 30.8703 4.55054 26.4673C4.11634 25.3261 3.94708 24.1481 4.01422 23.0013L4.00682 7.30426ZM5.25308 23.0374L5.24567 7.30369C5.24514 6.18486 6.65713 5.66446 7.40529 6.50775L17.7823 18.2039C18.5713 18.9415 19.2067 19.862 19.6138 20.9318C21.0493 24.7049 19.1008 28.9074 15.2616 30.3182C11.4224 31.729 7.14645 29.814 5.71092 26.0409C5.33387 25.0499 5.19028 24.0293 5.25308 23.0374ZM19.2177 17.7961L29.5947 29.4923C30.3429 30.3355 31.7549 29.8151 31.7543 28.6963L31.7469 12.9627C31.8097 11.9708 31.6661 10.9501 31.2891 9.95909C29.8535 6.18598 25.5776 4.27098 21.7384 5.68181C17.8992 7.09265 15.9507 11.2951 17.3862 15.0682C17.7932 16.138 18.4287 17.0585 19.2177 17.7961Z" fill="url(#paint0_linear_6204_161291)"/>
<defs>
<linearGradient id="paint0_linear_6204_161291" x1="7.51026" y1="5.29143" x2="30.2751" y2="32.3154" gradientUnits="userSpaceOnUse">
<stop stop-color="#ADA3F4"/>
<stop offset="1" stop-color="#85E0A3"/>
</linearGradient>
</defs>
</svg>
`

;(() => {
  const script = document.currentScript
  const widgetBaseUrl = script.dataset.widgetUrl ?? new URL(script.src).origin

  let opened = false
  let expanded = script.dataset.expanded === 'true'

  const loadWidget = () => {
    const searchParams = new URLSearchParams(script.dataset)
    const widgetUrl = `${widgetBaseUrl}?${searchParams.toString()}`

    const widget = document.createElement('div')
    widget.style.boxSizing = 'border-box'
    widget.style.width = '4rem'
    widget.style.height = '4rem'
    widget.style.position = 'fixed'
    widget.style.bottom = '0rem'
    widget.style.right = '0rem'
    widget.style.overflow = 'visible'
    widget.style.zIndex = '1000000'

    const style = document.createElement('style')
    const button = document.createElement('button')
    button.id = 'numbers-station-widget-button'
    button.innerHTML = NUMBERS_STATION_ICON_SVG
    button.style.display = 'flex'
    button.style.justifyContent = 'center'
    button.style.alignItems = 'center'
    button.style.width = '4rem'
    button.style.height = '4rem'
    button.style.background = script.dataset.buttonColor ?? '#171717'
    button.style.position = 'absolute'
    button.style.border = '0'
    button.style.borderRadius = '100%'
    button.style.bottom = '1rem'
    button.style.transition = BUTTON_ANIMATION
    button.style.right = '1rem'
    button.style.cursor = 'pointer'
    button.style.transition = 'scale 150ms cubic-bezier(0.4, 0, 0.2, 1)'
    const css = `#${button.id}:hover { scale: 1.1 }`
    if (style.styleSheet) {
      style.styleSheet.cssText = css
    } else {
      style.appendChild(document.createTextNode(css))
    }

    const iframe = document.createElement('iframe')
    iframe.src = widgetUrl
    iframe.allow = 'clipboard-read; clipboard-write'
    iframe.allowTransparency = 'true'
    iframe.border = 'border: 4px solid black'
    iframe.style.display = 'block'
    iframe.style.boxSizing = 'borderBox'
    iframe.style.position = script.dataset.parentElementId
      ? 'static'
      : 'absolute'
    iframe.style.right = 0
    iframe.style.bottom = '0rem'
    iframe.style.border = '1px solid rgb(230, 230, 230)'
    iframe.style.margin = 0
    iframe.style.width = '0rem'
    iframe.style.height = '0rem'
    iframe.style.transition = WIDGET_ANIMATION
    iframe.style.marginRight = '1rem'
    iframe.style.marginBottom = '1rem'
    iframe.style.overflow = 'hidden'
    iframe.style.backgroundColor = 'transparent'
    iframe.style.boxShadow =
      script.dataset.showShadow === 'false'
        ? null
        : 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px'
    iframe.style.borderRadius = script.dataset.borderRadius ?? '12px'
    iframe.style.background = 'white'

    const hide = () => {
      iframe.style.height = '0rem'
      iframe.style.width = '0rem'
      iframe.style.opacity = 0
      opened = false
    }

    const show = () => {
      if (expanded) {
        iframe.style.height = script.dataset.parentElementId ? '100%' : '100vh'
        iframe.style.width = script.dataset.parentElementId ? '100%' : '100vw'
        iframe.style.marginRight = '0rem'
        iframe.style.marginBottom = '0rem'
        iframe.style.maxWidth = '100vw'
        iframe.style.maxHeight = '100vh'
        document.body.style.overflow = 'hidden'
      } else {
        iframe.style.height = 'calc(80vh - 2rem)'
        iframe.style.width = '30rem'
        iframe.style.marginRight = '1rem'
        iframe.style.marginBottom = '1rem'
        iframe.style.maxWidth = 'calc(100vw - 3rem)'
        iframe.style.maxHeight = 'calc(100vh - 2rem)'
        document.body.style.overflow = 'visible'
      }
      iframe.style.opacity = 1
      opened = true
    }

    const api = {
      sendMessage: (message) => {
        iframe.contentWindow.postMessage(
          {
            sendMessage: message,
          },
          widgetBaseUrl,
        )
      },
      setChatId: (chatId) => {
        iframe.contentWindow.postMessage(
          {
            setChatId: chatId,
          },
          widgetBaseUrl,
        )
      },
      setShowOpenInFullButton: (value) => {
        iframe.contentWindow.postMessage(
          {
            setShowOpenInFullButton: value,
          },
          widgetBaseUrl,
        )
      },
      setChatInput: (value) => {
        iframe.contentWindow.postMessage(
          {
            setChatInput: value,
          },
          widgetBaseUrl,
        )
      },
      setButtonColor: (value) => {
        button.style.background = value
      },
      show,
      hide,
      toggle: () => {
        if (opened) {
          hide()
        } else {
          show()
        }
      },
      toggleSidebar: () => {
        iframe.contentWindow.postMessage(
          {
            toggleSidebar: true,
          },
          widgetBaseUrl,
        )
      },
      expand: () => {
        expanded = true
        show()
      },
      setBearerToken: (token) => {
        iframe.contentWindow.postMessage(
          {
            setBearerToken: token,
          },
          widgetBaseUrl,
        )
      },
    }

    iframe.addEventListener('load', () => {
      window.addEventListener('getWidgetApi', () => {
        const event = new CustomEvent('widgetApi', { detail: api })
        window.dispatchEvent(event)
      })

      window.addEventListener('message', (event) => {
        if (event.data === 'hide') {
          api.hide()
        }
        if (event.data === 'shrink') {
          expanded = false
          api.show()
        }
        if (event.data === 'expand') {
          expanded = true
          api.show()
        }
      })

      widget.style.display = 'block'
    })

    let timer = 0
    window.addEventListener('resize', function () {
      if (timer) {
        clearTimeout(timer)
        timer = null
      } else iframe.style.transition = 'none'

      timer = setTimeout(() => {
        iframe.style.transition = WIDGET_ANIMATION
        timer = null
      }, 100)
    })

    button.addEventListener('click', () => api.toggle())

    if (script.dataset.parentElementId) {
      const parentElement = document.getElementById(
        script.dataset.parentElementId,
      )
      if (!parentElement) {
        console.error(`The Numbers Station widget couldn't find the element
          with ID ${script.dataset.parentElementId}. Please make sure it exists before using
          the parent ID widget option.`)
        return
      }
      parentElement.appendChild(iframe)
      api.show()
    } else {
      widget.appendChild(style)
      widget.appendChild(button)
      widget.appendChild(iframe)
      document.body.appendChild(widget)
    }
  }

  if (document.readyState === 'complete') {
    loadWidget()
  } else {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        loadWidget()
      }
    })
  }
})()
