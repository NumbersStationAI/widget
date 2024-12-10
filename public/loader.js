;(() => {
  const script = document.currentScript
  const origin = script.src.split('/').slice(0, -1).join('/')

  const WIDGET_ANIMATION = '0.2s ease-in'
  const BUTTON_ANIMATION = '0.15s ease-in'

  const loadWidget = () => {
    const widget = document.createElement('div')
    let expanded = script.getAttribute('data-expanded') === 'true'

    const account = script.getAttribute('data-account')
    const showOpenInFullButton = script.getAttribute(
      'data-show-open-in-full-button',
    )
    const buttonColor = script.getAttribute('data-button-color')
    const showBorder = script.getAttribute('data-show-border') ?? 'true'
    const showShadow = script.getAttribute('data-show-shadow') ?? 'true'
    const borderRadius = script.getAttribute('data-border-radius') ?? '12px'
    const showMinimizeButton =
      script.getAttribute('data-show-minimize-button') ?? 'true'
    const showExpandButton =
      script.getAttribute('data-show-expand-button') ?? 'true'
    const args = {
      account: account,
      showOpenInFullButton: showOpenInFullButton,
      showBorder: showBorder,
      showMinimizeButton: showMinimizeButton,
      showExpandButton: showExpandButton,
      expanded: expanded.toString(),
      parentParams: encodeURIComponent(window.location.search),
    }
    const searchString = Object.keys(args)
      .map((key) => key + '=' + args[key])
      .join('&')
    const widgetUrl = `${origin}?${searchString}`

    const widgetStyle = widget.style
    widgetStyle.boxSizing = 'border-box'
    widgetStyle.width = '4rem'
    widgetStyle.height = '4rem'
    widgetStyle.position = 'fixed'
    widgetStyle.bottom = '0rem'
    widgetStyle.right = '0rem'
    widgetStyle.overflow = 'visible'

    const iframe = document.createElement('iframe')
    const button = document.createElement('button')

    const buttonStyle = button.style
    buttonStyle.display = 'flex'
    buttonStyle.justifyContent = 'center'
    buttonStyle.alignItems = 'center'
    buttonStyle.width = '4rem'
    buttonStyle.height = '4rem'
    buttonStyle.background = buttonColor ?? '#171717'
    buttonStyle.position = 'absolute'
    buttonStyle.borderRadius = '100%'
    buttonStyle.bottom = '1rem'
    buttonStyle.transition = BUTTON_ANIMATION
    buttonStyle.right = '1rem'
    buttonStyle.cursor = 'pointer'

    button.innerHTML = `<svg width="37" height="36" viewBox="0 0 37 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.00682 7.30426C4.00576 5.05988 6.83821 4.01597 8.33903 5.70759L15.8399 14.162C15.0276 10.1432 17.2726 6.02305 21.3045 4.5414C25.7845 2.89506 30.7743 5.12973 32.4495 9.53267C32.8837 10.6739 33.0529 11.8519 32.9858 12.9988L32.9932 28.6957C32.9942 30.9401 30.1618 31.984 28.661 30.2924L21.1601 21.838C21.9724 25.8568 19.7274 29.9769 15.6955 31.4586C11.2155 33.1049 6.2257 30.8703 4.55054 26.4673C4.11634 25.3261 3.94708 24.1481 4.01422 23.0013L4.00682 7.30426ZM5.25308 23.0374L5.24567 7.30369C5.24514 6.18486 6.65713 5.66446 7.40529 6.50775L17.7823 18.2039C18.5713 18.9415 19.2067 19.862 19.6138 20.9318C21.0493 24.7049 19.1008 28.9074 15.2616 30.3182C11.4224 31.729 7.14645 29.814 5.71092 26.0409C5.33387 25.0499 5.19028 24.0293 5.25308 23.0374ZM19.2177 17.7961L29.5947 29.4923C30.3429 30.3355 31.7549 29.8151 31.7543 28.6963L31.7469 12.9627C31.8097 11.9708 31.6661 10.9501 31.2891 9.95909C29.8535 6.18598 25.5776 4.27098 21.7384 5.68181C17.8992 7.09265 15.9507 11.2951 17.3862 15.0682C17.7932 16.138 18.4287 17.0585 19.2177 17.7961Z" fill="url(#paint0_linear_6204_161291)"/>
<defs>
<linearGradient id="paint0_linear_6204_161291" x1="7.51026" y1="5.29143" x2="30.2751" y2="32.3154" gradientUnits="userSpaceOnUse">
<stop stop-color="#ADA3F4"/>
<stop offset="1" stop-color="#85E0A3"/>
</linearGradient>
</defs>
</svg>
`

    const iframeStyle = iframe.style
    iframe.src = widgetUrl
    iframe.allow = 'clipboard-read; clipboard-write'
    iframe.allowTransparency = 'true'
    iframe.border = 'border: 4px solid black'
    iframeStyle.display = 'block'
    iframeStyle.boxSizing = 'borderBox'
    iframeStyle.position = 'absolute'
    iframeStyle.right = 0
    iframeStyle.bottom = '0rem'
    iframeStyle.border = 0
    iframeStyle.margin = 0
    iframeStyle.width = '0rem'
    iframeStyle.height = '0rem'
    iframeStyle.transition = WIDGET_ANIMATION
    iframeStyle.marginRight = '1rem'
    iframeStyle.marginBottom = '1rem'
    iframeStyle.overflow = 'hidden'
    iframeStyle.backgroundColor = 'transparent'
    iframeStyle.boxShadow =
      showShadow === 'true' && 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px'
    iframeStyle.borderRadius = borderRadius ?? '12px'
    iframeStyle.background = 'white'

    widget.appendChild(button)
    widget.appendChild(iframe)

    const hide = () => {
      iframeStyle.height = '0rem'
      iframeStyle.width = '0rem'
      iframeStyle.opacity = 0
    }

    const show = () => {
      if (expanded) {
        iframeStyle.height = 'calc(100vh)'
        iframeStyle.width = 'calc(100vw)'
        iframeStyle.marginRight = '0rem'
        iframeStyle.marginBottom = '0rem'
        iframeStyle.maxWidth = 'calc(100vw)'
        iframeStyle.maxHeight = 'calc(100vh)'
        document.body.style.overflow = 'hidden'
      } else {
        iframeStyle.height = 'calc(80vh - 2rem)'
        iframeStyle.width = '30rem'
        iframeStyle.marginRight = '1rem'
        iframeStyle.marginBottom = '1rem'
        iframeStyle.maxWidth = 'calc(100vw - 3rem)'
        iframeStyle.maxHeight = 'calc(100vh - 2rem)'
        document.body.style.overflow = 'visible'
      }
      iframeStyle.opacity = 1
    }

    const api = {
      sendMessage: (message) => {
        iframe.contentWindow.postMessage(
          {
            sendMessage: message,
          },
          origin,
        )
      },
      setChatId: (chatId) => {
        iframe.contentWindow.postMessage(
          {
            setChatId: chatId,
          },
          origin,
        )
      },
      show: show,
      hide: hide,
      setShowOpenInFullButton: (value) => {
        iframe.contentWindow.postMessage(
          {
            setShowOpenInFullButton: value,
          },
          origin,
        )
      },
      setChatInput: (value) => {
        iframe.contentWindow.postMessage(
          {
            setChatInput: value,
          },
          origin,
        )
      },
      setButtonColor: (value) => {
        buttonStyle.background = value
      },

      toggleSidebar: () => {
        iframe.contentWindow.postMessage(
          {
            toggleSidebar: true,
          },
          origin,
        )
      },
      expand: () => {
        expanded = true
        show()
      },
      toggle: () => {
        const width = window.getComputedStyle(iframe, null).width
        if (width === '0px') {
          show()
        } else {
          hide()
        }
      },
    }

    iframe.addEventListener('load', () => {
      window.addEventListener('getWidgetApi', () => {
        const event = new CustomEvent('widgetApi', { detail: api })
        window.dispatchEvent(event)
      })

      window.addEventListener('message', (evt) => {
        if (evt.origin !== origin) {
          return
        }

        if (evt.data === 'hide') {
          api.hide()
        }
        if (evt.data === 'shrink') {
          expanded = false
          show()
        }

        if (evt.data === 'expand') {
          expanded = true
          show()
        }
      })

      widgetStyle.display = 'block'
    })

    let timer = 0
    window.addEventListener('resize', function () {
      if (timer) {
        clearTimeout(timer)
        timer = null
      } else iframeStyle.transition = 'none'

      timer = setTimeout(() => {
        iframeStyle.transition = WIDGET_ANIMATION
        timer = null
      }, 100)
    })

    button.addEventListener('click', () => {
      api.toggle()
    })

    button.addEventListener('mouseover', () => {
      buttonStyle.scale = '1.1'
    })

    button.addEventListener('mouseout', () => {
      buttonStyle.scale = '1'
    })

    document.body.appendChild(widget)
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
