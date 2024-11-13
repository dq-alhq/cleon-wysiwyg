'use client'

import * as React from 'react'
import { tv } from 'tailwind-variants'
import type { MenuContentProps } from './menu'
import { Menu } from './menu'

interface ContextMenuTriggerContextType {
    buttonRef: React.RefObject<HTMLButtonElement>
    contextMenuOffset: { offset: number; crossOffset: number } | null
    setContextMenuOffset: React.Dispatch<React.SetStateAction<{ offset: number; crossOffset: number } | null>>
}

const ContextMenuTriggerContext = React.createContext<ContextMenuTriggerContextType | undefined>(undefined)

const useContextMenuTrigger = () => {
    const context = React.useContext(ContextMenuTriggerContext)
    if (!context) {
        throw new Error('useContextMenuTrigger must be used within a ContextMenuTrigger')
    }
    return context
}

interface ContextMenuRootComponent {
    children: React.ReactNode
}

const ContextMenu = ({ children }: ContextMenuRootComponent) => {
    const [contextMenuOffset, setContextMenuOffset] = React.useState<{
        offset: number
        crossOffset: number
    } | null>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    return (
        <ContextMenuTriggerContext.Provider value={{ buttonRef, contextMenuOffset, setContextMenuOffset }}>
            {children}
        </ContextMenuTriggerContext.Provider>
    )
}

const contextMenuTriggerStyles = tv({
    base: 'focus:outline-none cursor-default outline outline-ring outline-offset-2',
    variants: {
        isFocusVisible: {
            false: 'outline-0',
            true: 'outline-2',
        },
        isDisabled: {
            true: 'cursor-default opacity-60',
        },
    },
})

type ContextMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const ContextMenuTrigger = ({ className, ...props }: ContextMenuTriggerProps) => {
    const { buttonRef, setContextMenuOffset } = useContextMenuTrigger()

    const onContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        setContextMenuOffset({
            offset: e.clientY - rect.bottom,
            crossOffset: e.clientX - rect.left,
        })
    }
    return (
        <button
            className={contextMenuTriggerStyles({ isDisabled: props.disabled, className })}
            ref={buttonRef}
            aria-haspopup='menu'
            onContextMenu={onContextMenu}
            {...props}
        />
    )
}

type ContextMenuContentProps<T> = Omit<
    MenuContentProps<T>,
    'showArrow' | 'isOpen' | 'onOpenChange' | 'triggerRef' | 'placement' | 'shouldFlip'
>

const ContextMenuContent = <T extends object>(props: ContextMenuContentProps<T>) => {
    const { contextMenuOffset, setContextMenuOffset, buttonRef } = useContextMenuTrigger()
    return contextMenuOffset ? (
        <Menu.Content
            isOpen={!!contextMenuOffset}
            onOpenChange={() => setContextMenuOffset(null)}
            triggerRef={buttonRef}
            shouldFlip={false}
            placement='bottom left'
            offset={contextMenuOffset?.offset}
            crossOffset={contextMenuOffset?.crossOffset}
            onClose={() => setContextMenuOffset(null)}
            {...props}
        />
    ) : null
}

ContextMenu.Trigger = ContextMenuTrigger
ContextMenu.Content = ContextMenuContent
ContextMenu.Item = Menu.Item
ContextMenu.Separator = Menu.Separator
ContextMenu.ItemDetails = Menu.ItemDetails
ContextMenu.Section = Menu.Section
ContextMenu.Header = Menu.Header
ContextMenu.Keyboard = Menu.Keyboard

export { ContextMenu }
