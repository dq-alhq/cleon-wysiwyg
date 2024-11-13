'use client'

import { type ReactNode } from 'react'
import { IconCheck, IconMinus } from 'cleon-icons'
import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { cn } from '@/lib/utils'
import { Description, FieldError, Label } from './field'

interface CheckboxGroupProps extends Omit<Aria.CheckboxGroupProps, 'children'> {
    label?: string
    children?: ReactNode
    description?: string
    errorMessage?: string | ((validation: Aria.ValidationResult) => string)
}

const CheckboxGroup = (props: CheckboxGroupProps) => {
    return (
        <Aria.CheckboxGroup {...props} className={cn('flex flex-col gap-y-2', props.className)}>
            <Label>{props.label}</Label>
            <>{props.children}</>
            {props.description && <Description className='block'>{props.description}</Description>}
            <FieldError>{props.errorMessage}</FieldError>
        </Aria.CheckboxGroup>
    )
}

const checkboxStyles = tv({
    base: 'racc group flex items-center gap-2 text-sm transition',
    variants: {
        isDisabled: {
            false: 'opacity-100',
            true: 'opacity-50',
        },
    },
})

const boxStyles = tv({
    base: 'flex size-4 [&>svg]:size-3 flex-shrink-0 items-center justify-center rounded border text-background transition',
    variants: {
        isSelected: {
            false: 'border-muted',
            true: [
                'border-primary/70 bg-primary text-primary-foreground',
                'group-invalid:border-danger/70 group-invalid:bg-danger group-invalid:text-danger-foreground',
            ],
        },
        isFocused: {
            true: [
                'border-primary/70 ring-4 ring-primary/20',
                'group-invalid:border-danger/70 group-invalid:text-danger-foreground group-invalid:ring-danger/20',
            ],
        },
        isInvalid: {
            true: 'border-danger/70 bg-danger/20 text-danger-foreground ring-danger/20',
        },
    },
})

interface CheckboxProps extends Aria.CheckboxProps {
    description?: string
    label?: string
    children?: ReactNode
}

const Checkbox = ({ className, description, label, children, ...props }: CheckboxProps) => {
    return (
        <Aria.Checkbox
            {...props}
            className={Aria.composeRenderProps(className, (className, renderProps) =>
                checkboxStyles({ ...renderProps, className }),
            )}
        >
            {({ isSelected, isIndeterminate, ...renderProps }) => (
                <div className={cn('flex gap-x-2', description ? 'items-start' : 'items-center')}>
                    <div
                        className={boxStyles({
                            ...renderProps,
                            isSelected: isSelected || isIndeterminate,
                            className: description ? 'mt-1' : 'mt-px',
                        })}
                    >
                        {isIndeterminate ? <IconMinus /> : isSelected ? <IconCheck /> : null}
                    </div>

                    <div className='flex flex-col gap-1'>
                        {label ? <Label>{label}</Label> : children}
                        {description && <Description>{description}</Description>}
                    </div>
                </div>
            )}
        </Aria.Checkbox>
    )
}

export { Checkbox, CheckboxGroup }
