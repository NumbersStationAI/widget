'use client'

import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'
import {
  type AnimationEventHandler,
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { cn } from '@ns/ui/utils/cn'

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = forwardRef<
  ElementRef<typeof SheetPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/10',
      className,
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-300',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left resize-x',
        right:
          'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right resize-x',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

interface SheetContentProps
  extends ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  initialWidth?: string
}

const SheetContent = forwardRef<
  ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps & { isFullscreen?: boolean }
>(
  (
    {
      side = 'right',
      className,
      children,
      initialWidth = '42rem',
      isFullscreen,
      ...props
    },
    ref,
  ) => {
    const [width, setWidth] = useState(initialWidth)
    const [isDragging, setIsDragging] = useState(false)
    const handleOpenChange: AnimationEventHandler<HTMLDivElement> = (event) => {
      const target = event.currentTarget
      if (target.dataset.state === 'closed') {
        setWidth(initialWidth)
      }
    }

    const handleResize = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        if (isFullscreen || !isDragging) return
        const newWidth =
          side === 'right' ? window.innerWidth - event.clientX : event.clientX
        setWidth(`${Math.max(200, Math.min(window.innerWidth, newWidth))}px`)
      },
      [side, isFullscreen, isDragging],
    )

    useEffect(() => {
      if (!isFullscreen) {
        setWidth(initialWidth)
      }
    }, [isFullscreen, initialWidth])

    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          ref={ref}
          onAnimationEnd={handleOpenChange}
          className={cn(sheetVariants({ side }), className)}
          style={{
            width: isFullscreen
              ? '100vw'
              : side === 'top' || side === 'bottom'
                ? '100%'
                : width,
            minWidth: isFullscreen ? '100vw' : '200px',
            maxWidth: isFullscreen ? '100vw' : '100%',
          }}
          {...props}
        >
          {(side === 'left' || side === 'right') && !isFullscreen && (
            <div
              className='absolute inset-y-0 cursor-ew-resize touch-none select-none'
              style={{
                [side === 'right' ? 'left' : 'right']: 0,
                width: '4px',
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                setIsDragging(true)
              }}
              onPointerMove={handleResize}
              onPointerUp={(event) => {
                event.currentTarget.releasePointerCapture(event.pointerId)
                setIsDragging(false)
              }}
              onPointerCancel={() => setIsDragging(false)}
            />
          )}
          {children}
          <SheetPrimitive.Close className='ring-offset-background focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </SheetPrimitive.Close>
        </SheetPrimitive.Content>
      </SheetPortal>
    )
  },
)
SheetContent.displayName = SheetPrimitive.Content.displayName

function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-2 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  )
}
SheetHeader.displayName = 'SheetHeader'

function SheetFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      )}
      {...props}
    />
  )
}
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = forwardRef<
  ElementRef<typeof SheetPrimitive.Title>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-foreground text-lg font-semibold', className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = forwardRef<
  ElementRef<typeof SheetPrimitive.Description>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
