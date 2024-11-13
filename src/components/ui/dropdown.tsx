'use client'

import { IconCheck } from 'cleon-icons'
import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { cn } from '@/lib/utils'

const dropdownItemStyles = tv({
    base: [
        'group flex cursor-default select-none items-center gap-x-1.5 rounded-[calc(var(--radius)-1px)] py-2 pl-2.5 relative pr-1.5 text-base outline outline-0 forced-color-adjust-none lg:text-sm',
        'has-submenu:open:data-[danger=true]:bg-danger/20 has-submenu:open:data-[danger=true]:text-danger',
        'has-submenu:open:bg-primary has-submenu:open:text-primary-foreground [&[data-has-submenu][data-open]>[data-slot=icon]]:text-primary-foreground',
        '[&_[data-slot=avatar]]:-mr-0.5 [&_[data-slot=avatar]]:size-6 sm:[&_[data-slot=avatar]]:size-5',
        '[&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-muted-foreground [&[data-hovered]>[data-slot=icon]]:text-primary-foreground [&[data-focused]>[data-slot=icon]]:text-primary-foreground [&[data-danger]>[data-slot=icon]]:text-danger/60',
    ],
    variants: {
        isDisabled: {
            false: 'text-foreground',
            true: 'text-muted-foreground forced-colors:text-[GrayText]',
        },
        isFocused: {
            false: 'data-[danger=true]:text-danger',
            true: [
                'bg-primary text-primary-foreground forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
                'data-[danger=true]:bg-danger data-[danger=true]:text-danger-foreground',
                '[&_.text-muted-foreground]:text-primary-foreground/80 [&[data-slot=label]]:text-primary-foreground [&[data-slot=description]]:text-primary-foreground',
            ],
        },
    },
    compoundVariants: [
        {
            isFocused: false,
            isOpen: true,
            className: 'bg-muted',
        },
    ],
})

interface DropdownSectionProps<T> extends Aria.SectionProps<T> {
    title?: string
}

const dropdownSectionStyles = tv({
    slots: {
        section: "-mt-[5px] pb-0.5 xss3 flex flex-col gap-y-0.5 after:content-[''] after:block after:h-[5px]",
        header: 'text-sm d-head font-medium text-muted-foreground bg-background px-4 py-2 truncate min-w-[--trigger-width] sticky -top-[5px] backdrop-blur -mt-px -mb-0.5 -mx-1 z-10 supports-[-moz-appearance:none]:bg-background border-y [&+*]:mt-1',
    },
})

const { section, header } = dropdownSectionStyles()

const DropdownSection = <T extends object>({ className, ...props }: DropdownSectionProps<T>) => {
    return (
        <Aria.Section className={section({ className })}>
            {'title' in props && <Aria.Header className={header()}>{props.title}</Aria.Header>}
            <Aria.Collection items={props.items}>{props.children}</Aria.Collection>
        </Aria.Section>
    )
}

const DropdownItem = ({ className, ...props }: Aria.ListBoxItemProps) => {
    const textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined)
    return (
        <Aria.ListBoxItem
            textValue={textValue}
            className={Aria.composeRenderProps(className, (className, renderProps) =>
                dropdownItemStyles({ ...renderProps, className }),
            )}
            {...props}
        >
            {Aria.composeRenderProps(props.children, (children, { isSelected }) => (
                <>
                    <span className='flex flex-1 items-center gap-2 truncate font-normal group-selected:font-medium'>
                        {children}
                    </span>

                    {isSelected && (
                        <span className='absolute right-2 top-3 lg:top-2.5'>
                            <IconCheck />
                        </span>
                    )}
                </>
            ))}
        </Aria.ListBoxItem>
    )
}

interface DropdownItemSlot extends Aria.TextProps {
    label?: Aria.TextProps['children']
    description?: Aria.TextProps['children']
    classNames?: {
        label?: Aria.TextProps['className']
        description?: Aria.TextProps['className']
    }
}

const DropdownItemDetails = ({ label, description, classNames, ...props }: DropdownItemSlot) => {
    const { slot, children, title, ...restProps } = props

    return (
        <div className='flex flex-col gap-1' {...restProps}>
            {label && (
                <Aria.Text
                    slot={slot ?? 'label'}
                    className={cn('font-medium lg:text-sm', classNames?.label)}
                    {...restProps}
                >
                    {label}
                </Aria.Text>
            )}
            {description && (
                <Aria.Text
                    slot={slot ?? 'description'}
                    className={cn('text-muted-foreground text-xs', classNames?.description)}
                    {...restProps}
                >
                    {description}
                </Aria.Text>
            )}
            {!title && children}
        </div>
    )
}

// Note: This is not exposed component, but it's used in other components to render dropdowns.
export { DropdownItem, DropdownItemDetails, dropdownItemStyles, DropdownSection }
