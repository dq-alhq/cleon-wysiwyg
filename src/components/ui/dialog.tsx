'use client'

import * as React from 'react'
import { IconX } from 'cleon-icons'
import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { cn, useMediaQuery } from '@/lib/utils'
import { Button, type ButtonProps } from './button'

const Dialog = ({ role, className, ...props }: Aria.DialogProps) => {
    return (
        <Aria.Dialog
            {...props}
            role={role ?? 'dialog'}
            className={cn(
                'dlc relative flex max-h-[inherit] flex-col overflow-hidden outline-none',
                'sm:[&:not(:has([data-slot=dialog-body]))]:px-6 sm:[&:has([data-slot=dialog-body])_[data-slot=dialog-header]]:px-6 sm:[&:has([data-slot=dialog-body])_[data-slot=dialog-footer]]:px-6',
                '[&:not(:has([data-slot=dialog-body]))]:px-4 [&:has([data-slot=dialog-body])_[data-slot=dialog-header]]:px-4 [&:has([data-slot=dialog-body])_[data-slot=dialog-footer]]:px-4',
                className,
            )}
        />
    )
}

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    description?: string
}

const Trigger = (props: Aria.ButtonProps) => (
    <Aria.Button className={cn('outline-none focus:outline-none', props.className)} {...props}>
        {(values) => <>{typeof props.children === 'function' ? props.children(values) : props.children}</>}
    </Aria.Button>
)

const Header = ({ className, ...props }: DialogHeaderProps) => {
    const headerRef = React.useRef<HTMLHeadingElement>(null)

    React.useEffect(() => {
        const header = headerRef.current
        if (!header) {
            return
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                header.parentElement?.style.setProperty('--dialog-header-height', `${entry.target.clientHeight}px`)
            }
        })

        observer.observe(header)
        return () => observer.unobserve(header)
    }, [])

    return (
        <div
            data-slot='dialog-header'
            ref={headerRef}
            className={cn('relative flex flex-col pb-3 pt-4 sm:pt-6', className)}
        >
            {props.title && <Title>{props.title}</Title>}
            {props.description && <Description>{props.description}</Description>}
            {!props.title && typeof props.children === 'string' ? <Title {...props} /> : props.children}
        </div>
    )
}

const titleStyles = tv({
    base: 'flex flex-1 items-center text-foreground',
    variants: {
        level: {
            1: 'font-semibold text-lg sm:text-xl',
            2: 'font-semibold text-lg sm:text-xl',
            3: 'font-semibold text-base sm:text-lg',
            4: 'font-semibold text-base',
        },
    },
})

interface TitleProps extends Omit<Aria.HeadingProps, 'level'> {
    level?: 1 | 2 | 3 | 4
}

const Title = ({ level = 2, className, ...props }: TitleProps) => (
    <Aria.Heading slot='title' level={level} className={titleStyles({ level, className })} {...props} />
)

const Description = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('text-sm block text-muted-foreground mt-0.5 sm:mt-1', className)} {...props} />
)

const Body = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        data-slot='dialog-body'
        className={cn(
            'flex flex-1 flex-col gap-2 px-4 sm:px-6 overflow-auto py-1',
            'max-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding)-var(--dialog-header-height,0px)-var(--dialog-footer-height,0px))]',
            className,
        )}
        {...props}
    />
)

const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const footerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const footer = footerRef.current

        if (!footer) {
            return
        }

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                footer.parentElement?.style.setProperty('--dialog-footer-height', `${entry.target.clientHeight}px`)
            }
        })

        observer.observe(footer)
        return () => {
            observer.unobserve(footer)
        }
    }, [])
    return (
        <div
            ref={footerRef}
            data-slot='dialog-footer'
            className={cn(
                'mt-auto flex flex-col-reverse justify-between gap-3 pb-4 sm:pb-6 pt-4 sm:flex-row',
                className,
            )}
            {...props}
        />
    )
}

const Close = ({ className, variant = 'outline', ...props }: ButtonProps) => {
    const state = React.useContext(Aria.OverlayTriggerStateContext)!
    return <Button className={className} variant={variant} onPress={() => state.close()} {...props} />
}

interface CloseButtonIndicatorProps {
    className?: string
    close: () => void
    isDismissable?: boolean | undefined
}

const CloseIndicator = ({ className, ...props }: CloseButtonIndicatorProps) => {
    const isMobile = useMediaQuery('(max-width: 600px)')
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
        if (isMobile && buttonRef.current) {
            buttonRef.current.focus()
        }
    }, [isMobile])
    return props.isDismissable ? (
        <Aria.Button
            ref={buttonRef}
            {...(isMobile ? { autoFocus: true } : {})}
            aria-label='Close'
            onPress={props.close}
            className={cn(
                'close absolute right-1 top-1 sm:right-2 sm:top-2 focus:outline-none focus:bg-muted/50 hover:bg-muted/50 grid place-content-center rounded-xl sm:rounded-md focus-visible:ring-1 focus-visible:ring-primary size-8 sm:size-7 z-50',
                className,
            )}
        >
            <IconX className='size-4' />
        </Aria.Button>
    ) : null
}

Dialog.Trigger = Trigger
Dialog.Header = Header
Dialog.Title = Title
Dialog.Description = Description
Dialog.Body = Body
Dialog.Footer = Footer
Dialog.Close = Close
Dialog.CloseIndicator = CloseIndicator

export { Dialog }
