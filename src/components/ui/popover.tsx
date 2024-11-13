'use client'

import * as React from 'react'
import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { cn, useMediaQuery } from '@/lib/utils'
import { Dialog } from './dialog'

const Popover = ({ children, ...props }: Aria.DialogTriggerProps) => {
    return <Aria.DialogTrigger {...props}>{children}</Aria.DialogTrigger>
}

const Title = ({ level = 2, className, ...props }: React.ComponentProps<typeof Dialog.Title>) => (
    <Dialog.Title className={cn('sm:leading-none', level === 2 && 'sm:text-lg', className)} {...props} />
)

const Header = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <Dialog.Header className={cn('p-1 sm:pt-0', className)} {...props} />
)

const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <Dialog.Footer className={cn('pt-4 pb-0 sm:pb-0 sm:px-1', className)} {...props} />
)

const Body = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <Dialog.Body className={cn('px-4 sm:p-1', className)} {...props} />
)

const popoverContentStyles = tv({
    base: [
        'max-w-xs min-w-80 p-4 rounded-xl border bg-background bg-clip-padding text-foreground shadow-sm dark:backdrop-blur-2xl dark:backdrop-saturate-200 lg:text-sm sm:max-w-3xl',
    ],
    variants: {
        isMenu: {
            true: {
                true: 'p-0',
            },
        },
        isEntering: {
            true: [
                'duration-50 ease-out animate-in fade-in placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 placement-top:slide-in-from-bottom-1 placement-bottom:slide-in-from-top-1',
            ],
        },
        isExiting: {
            true: 'duration-50 ease-in animate-out fade-out placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 placement-top:slide-out-to-bottom-1 placement-bottom:slide-out-to-top-1',
        },
    },
})

const drawerStyles = tv({
    base: [
        'fixed max-h-full bottom-0 top-auto z-50 w-full bg-background max-w-2xl border border-b-transparent outline-none',
    ],
    variants: {
        isMenu: {
            true: 'p-0 [&_[role=dialog]]:px-0 rounded-t-xl',
            false: 'py-4 rounded-t-3xl',
        },
        isEntering: {
            true: [
                '[will-change:transform] [transition:transform_0.5s_cubic-bezier(0.32,_0.72,_0,_1)]',
                'animate-in duration-200 fade-in-0 slide-in-from-bottom-56',
                '[transition:translate3d(0,_100%,_0)]',
                'sm:slide-in-from-bottom-auto sm:slide-in-from-top-[20%]',
            ],
        },
        isExiting: {
            true: 'duration-200 ease-in animate-out slide-out-to-bottom-56',
        },
    },
})

interface PopoverProps
    extends Omit<React.ComponentProps<typeof Aria.Modal>, 'children'>,
        Omit<Aria.PopoverProps, 'children' | 'className'>,
        Omit<Aria.ModalOverlayProps, 'className'> {
    children: React.ReactNode
    showArrow?: boolean
    style?: React.CSSProperties
    respectScreen?: boolean
    'aria-label'?: Aria.DialogProps['aria-label']
    'aria-labelledby'?: Aria.DialogProps['aria-labelledby']
    className?: string | ((values: { defaultClassName?: string }) => string)
}

const Content = ({ respectScreen = true, children, showArrow = true, className, ...props }: PopoverProps) => {
    const isMobile = useMediaQuery('(max-width: 600px)')
    const popoverContext = Aria.useSlottedContext(Aria.PopoverContext)!
    const isMenuTrigger = popoverContext?.trigger === 'MenuTrigger'
    const isSubmenuTrigger = popoverContext?.trigger === 'SubmenuTrigger'
    const isMenu = isMenuTrigger || isSubmenuTrigger
    const offset = showArrow ? 12 : 8
    const effectiveOffset = isSubmenuTrigger ? offset - 5 : offset
    return isMobile && respectScreen ? (
        <Aria.ModalOverlay
            className={cn(
                'fixed left-0 top-0 isolate z-50 h-[--visual-viewport-height] w-full bg-background/10 [--visual-viewport-vertical-padding:16px]',
                isSubmenuTrigger ? 'bg-background/10' : '',
            )}
            {...props}
            isDismissable
        >
            <Aria.Modal
                className={Aria.composeRenderProps(className, (className, renderProps) =>
                    drawerStyles({ ...renderProps, isMenu, className }),
                )}
            >
                <Dialog aria-label={isMenu ? 'Menu' : props['aria-label']} className='touch-none focus:outline-none'>
                    {children}
                </Dialog>
            </Aria.Modal>
        </Aria.ModalOverlay>
    ) : (
        <Aria.Popover
            offset={effectiveOffset}
            {...props}
            className={Aria.composeRenderProps(className, (className, renderProps) =>
                popoverContentStyles({
                    ...renderProps,
                    className,
                }),
            )}
        >
            {showArrow && (
                <Aria.OverlayArrow className='group'>
                    <svg
                        width={12}
                        height={12}
                        viewBox='0 0 12 12'
                        className='block fill-background stroke-muted group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180'
                    >
                        <path d='M0 0 L6 6 L12 0' />
                    </svg>
                </Aria.OverlayArrow>
            )}
            {children}
        </Aria.Popover>
    )
}

const Picker = ({ children, className, ...props }: PopoverProps) => {
    return (
        <Aria.Popover
            {...props}
            className={Aria.composeRenderProps(className as PopoverProps['className'], (className, renderProps) =>
                popoverContentStyles({
                    ...renderProps,
                    className: cn('max-h-72 min-w-[--trigger-width] overflow-y-auto p-0', className),
                }),
            )}
        >
            {children}
        </Aria.Popover>
    )
}

Popover.Trigger = Dialog.Trigger
Popover.Close = Dialog.Close
Popover.Content = Content
Popover.Description = Dialog.Description
Popover.Body = Body
Popover.Footer = Footer
Popover.Header = Header
Popover.Picker = Picker
Popover.Title = Title

export { drawerStyles, Popover, popoverContentStyles }
