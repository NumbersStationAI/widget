import { create } from '@kodingdotninja/use-tailwind-breakpoint'

const screens = {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}

export const { useBreakpoint } = create(screens)
