'use client'

import * as React from 'react'
import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { Separator } from './separator'
import type { ToggleProps } from './toggle'
import { Toggle, toggleStyles } from './toggle'

const toolbarStyles = tv({
    base: 'flex gap-2 group',
    variants: {
        orientation: {
            horizontal: 'flex-row [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]',
            vertical: 'flex-col items-start',
        },
    },
})

const ToolbarSeparator = ({ className, ...props }: Aria.SeparatorProps) => {
    const { orientation } = React.useContext(ToolbarContext)
    const effectiveOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical'
    return (
        <Separator
            orientation={effectiveOrientation}
            className={cn(effectiveOrientation === 'vertical' ? 'mx-1.5' : 'my-1.5 w-9', className)}
            {...props}
        />
    )
}

const ToolbarContext = React.createContext<{ orientation?: Aria.ToolbarProps['orientation'] }>({
    orientation: 'horizontal',
})

const Toolbar = ({ orientation = 'horizontal', ...props }: Aria.ToolbarProps) => {
    return (
        <ToolbarContext.Provider value={{ orientation }}>
            <Aria.Toolbar
                orientation={orientation}
                {...props}
                className={Aria.composeRenderProps(props.className, (className, renderProps) =>
                    toolbarStyles({ ...renderProps, className }),
                )}
            />
        </ToolbarContext.Provider>
    )
}

const toolbarGroupStyles = tv({
    base: ['flex gap-2', 'group-orientation-vertical:flex-col group-orientation-vertical:items-start'],
})

const ToolbarGroupContext = React.createContext<{ isDisabled?: boolean }>({})

const ToolbarGroup = ({ isDisabled, ...props }: Aria.GroupProps) => {
    return (
        <ToolbarGroupContext.Provider value={{ isDisabled }}>
            <Aria.Group className={toolbarGroupStyles()} {...props}>
                {props.children}
            </Aria.Group>
        </ToolbarGroupContext.Provider>
    )
}

const Item = ({ isDisabled, ...props }: ToggleProps) => {
    const context = React.useContext(ToolbarGroupContext)
    const effectiveIsDisabled = isDisabled || context.isDisabled

    return (
        <Toggle
            isDisabled={effectiveIsDisabled}
            {...props}
            className={Aria.composeRenderProps(props.className, (className, renderProps) =>
                toggleStyles({
                    ...renderProps,
                    variant: props.variant,
                    size: props.size,
                    shape: props.shape,
                    className,
                }),
            )}
        />
    )
}

Toolbar.Group = ToolbarGroup
Toolbar.Separator = ToolbarSeparator
Toolbar.Item = Item

export { Toolbar }
