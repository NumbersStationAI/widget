'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { VariantProps, cva } from 'class-variance-authority'
import { cn } from 'lib/utils'
import * as React from 'react'

const popoverVariants = cva(
  'z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none',
  {
    variants: {
      size: {
        sm: 'w-48 p-2',
        md: 'w-72 p-4',
        lg: 'w-96 p-6',
      },
      animation: {
        subtle: 'transition-all duration-200 ease-in-out',
        bounce: 'transition-all duration-300 ease-bounce',
        none: '',
      },
    },
    defaultVariants: {
      size: 'md',
      animation: 'subtle',
    },
  }
)

interface PopoverProps extends PopoverPrimitive.PopoverProps {
  defaultSide?: 'top' | 'right' | 'bottom' | 'left'
  modal?: boolean
}

const Popover = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Root>,
  PopoverProps
>(({ modal = false, ...props }, ref) => (
  <PopoverPrimitive.Root modal={modal} {...props} />
))
Popover.displayName = PopoverPrimitive.Root.displayName

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Trigger
    ref={ref}
    className={cn('focus-visible:outline-none focus-visible:ring-2', className)}
    {...props}
  />
))
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName

interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  VariantProps<typeof popoverVariants> {
  container?: HTMLElement
  hideArrow?: boolean
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({
  className,
  size,
  animation,
  align = 'center',
  sideOffset = 4,
  container,
  hideArrow = false,
  ...props
}, ref) => (
  <PopoverPrimitive.Portal container={container}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        popoverVariants({ size, animation }),
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    >
      {!hideArrow && (
        <PopoverPrimitive.Arrow
          className="fill-popover border-popover"
          width={11}
          height={5}
        />
      )}
      {props.children}
    </PopoverPrimitive.Content>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const PopoverClose = PopoverPrimitive.Close

export {
  Popover, PopoverClose, PopoverContent, PopoverTrigger, type PopoverContentProps, type PopoverProps
}
