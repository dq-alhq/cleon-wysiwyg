'use client'

import * as React from 'react'
import { IconCheck, IconChevronRight, IconCircleCheck } from 'cleon-icons'
import * as Aria from 'react-aria-components'
import type { VariantProps } from 'tailwind-variants'
import { tv } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { DropdownItemDetails, dropdownItemStyles, DropdownSection } from './dropdown'
import { Keyboard } from './keyboard'
import { Popover } from './popover'

interface MenuContextProps {
    respectScreen: boolean
}

const MenuContext = React.createContext<MenuContextProps>({ respectScreen: true })

interface MenuProps extends Aria.MenuTriggerProps {
    respectScreen?: boolean
}

const Menu = ({ respectScreen = true, ...props }: MenuProps) => {
    return (
        <MenuContext.Provider value={{ respectScreen }}>
            <Aria.MenuTrigger {...props}>{props.children}</Aria.MenuTrigger>
        </MenuContext.Provider>
    )
}

const SubMenu = ({ delay = 0, ...props }) => (
    <Aria.SubmenuTrigger {...props} delay={delay}>
        {props.children}
    </Aria.SubmenuTrigger>
)

const menuStyles = tv({
    slots: {
        menu: 'max-h-[calc(var(--visual-viewport-height)-10rem)] sm:max-h-[inherit] overflow-auto rounded-xl p-1 outline outline-0 [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))]',
        popover: 'z-50 min-w-40 p-0 outline-none shadow-sm',
        trigger: [
            'inline relative text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-primary pressed:outline-none',
        ],
    },
})

const { menu, popover, trigger } = menuStyles()

interface MenuTriggerProps extends Aria.ButtonProps {
    className?: string
}

const Trigger = ({ className, ...props }: MenuTriggerProps) => (
    <Aria.Button className={trigger({ className })} {...props}>
        {(values) => <>{typeof props.children === 'function' ? props.children(values) : props.children}</>}
    </Aria.Button>
)

interface MenuContentProps<T> extends Omit<Aria.PopoverProps, 'children' | 'style'>, Aria.MenuProps<T> {
    className?: string
    popoverClassName?: string
    showArrow?: boolean
    respectScreen?: boolean
}

const Content = <T extends object>({
    className,
    showArrow = false,
    popoverClassName,
    ...props
}: MenuContentProps<T>) => {
    const { respectScreen } = React.useContext(MenuContext)
    return (
        <Popover.Content
            respectScreen={respectScreen}
            showArrow={showArrow}
            className={popover({
                className: cn(
                    showArrow && 'placement-left:mt-[-0.38rem] placement-right:mt-[-0.38rem]',
                    popoverClassName,
                ),
            })}
            {...props}
        >
            <Aria.Menu className={menu({ className })} {...props} />
        </Popover.Content>
    )
}

interface MenuItemProps extends Omit<Aria.MenuItemProps, 'isDanger'>, VariantProps<typeof dropdownItemStyles> {
    isDanger?: boolean
}

const Item = ({ className, isDanger = false, children, ...props }: MenuItemProps) => {
    const textValue = props.textValue || (typeof children === 'string' ? children : undefined)
    return (
        <Aria.MenuItem
            textValue={textValue}
            className={Aria.composeRenderProps(className, (className, renderProps) =>
                dropdownItemStyles({
                    ...renderProps,
                    className,
                }),
            )}
            data-danger={isDanger ? 'true' : undefined}
            {...props}
        >
            {(values) => (
                <>
                    {typeof children === 'function' ? children(values) : children}
                    {values.hasSubmenu && <IconChevronRight className='gpfw ml-auto size-3.5' />}
                </>
            )}
        </Aria.MenuItem>
    )
}

export interface MenuHeaderProps extends React.ComponentProps<typeof Aria.Header> {
    separator?: boolean
}

const MenuHeader = ({ className, separator = false, ...props }: MenuHeaderProps) => (
    <Aria.Header
        className={cn(
            'p-2 text-base font-semibold sm:text-sm',
            separator && '-mx-1 border-b border-b-muted px-3 pb-2 mb-1',
            className,
        )}
        {...props}
    />
)

const MenuSeparator = ({ className, ...props }: Aria.SeparatorProps) => (
    <Aria.Separator className={cn('-mx-1 my-1 h-px ms bg-muted', className)} {...props} />
)

const Checkbox = ({ className, children, ...props }: MenuItemProps) => (
    <Item className={cn('relative pr-8', className)} {...props}>
        {(values) => (
            <>
                {typeof children === 'function' ? children(values) : children}
                {values.isSelected && (
                    <span className='absolute right-2 flex size-4 shrink-0 items-center animate-in justify-center'>
                        <IconCheck />
                    </span>
                )}
            </>
        )}
    </Item>
)

const Radio = ({ className, children, ...props }: MenuItemProps) => (
    <Item className={cn('pl-8 relative', className)} {...props}>
        {(values) => (
            <>
                {values.isSelected && (
                    <span className='absolute left-2.5 flex size-4 items-center animate-in justify-center'>
                        <IconCircleCheck className='size-4' />
                    </span>
                )}

                {typeof children === 'function' ? children(values) : children}
            </>
        )}
    </Item>
)

Menu.Content = Content
Menu.Header = MenuHeader
Menu.Item = Item
Menu.Content = Content
Menu.Keyboard = Keyboard
Menu.Checkbox = Checkbox
Menu.Radio = Radio
Menu.Section = DropdownSection
Menu.Separator = MenuSeparator
Menu.Trigger = Trigger
Menu.ItemDetails = DropdownItemDetails
Menu.Submenu = SubMenu

export { Menu, type MenuContentProps }
