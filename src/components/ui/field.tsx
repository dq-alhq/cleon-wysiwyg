'use client'

import * as React from 'react'
import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { cn } from '@/lib/utils'

interface FieldProps {
    label?: string
    placeholder?: string
    description?: string
    errorMessage?: string | ((validation: Aria.ValidationResult) => string)
    'aria-label'?: Aria.TextFieldProps['aria-label']
    'aria-labelledby'?: Aria.TextFieldProps['aria-labelledby']
}

const fieldBorderStyles = tv({
    base: 'group-focus-within:border-primary/85',
    variants: {
        isInvalid: {
            true: 'border-danger/70 group-focus-within:border-danger/70',
        },
    },
})

const fieldGroupPrefixStyles = tv({
    base: [
        'flex group-invalid:border-danger group-disabled:bg-muted group-disabled:opacity-50 items-center group-invalid:focus-within:ring-danger/20',
        '[&>.x2e2>.btn]:size-7 [&>.x2e2>.btn]:rounded-sm [&>.x2e2:has(.btn)]:size-9 [&>.x2e2:has(.btn)]:grid [&>.x2e2:has(.btn)]:place-items-center',
        '[&>.x2e2>.btn]:before:rounded-[calc(theme(borderRadius.sm)-1px)] [&>.x2e2>.btn]:after:rounded-[calc(theme(borderRadius.sm)-1px)] dark:[&>.x2e2>.btn]:after:rounded-sm',
        '[&>.suffix:has(.btn)]:-mr-2 [&>.prefix:has(.btn)]:-ml-2 [&>.suffix>.btn]:mr-0.5 [&>.prefix>.btn]:ml-0.5',
    ],
})

const fieldStyles = tv({
    slots: {
        description: 'text-pretty text-base/6 text-muted-foreground sm:text-sm/6',
        label: 'w-fit cursor-default font-medium text-foreground text-sm',
        fieldError: 'text-sm text-danger',
        input: [
            'w-full min-w-0 [&::-ms-reveal]:hidden bg-transparent p-2 text-base text-foreground placeholder-muted-foreground outline-none focus:outline-none lg:text-sm',
        ],
    },
})

const { description, label, fieldError, input } = fieldStyles()

const Label = ({ className, ...props }: Aria.LabelProps) => {
    return <Aria.Label {...props} className={label({ className })} />
}

interface DescriptionProps extends Aria.TextProps {
    isWarning?: boolean
}

const Description = ({ className, ...props }: DescriptionProps) => {
    const isWarning = props.isWarning ?? false
    return (
        <Aria.Text
            {...props}
            slot='description'
            className={description({ className: isWarning ? 'text-warning' : className })}
        />
    )
}

const FieldError = ({ className, ...props }: Aria.FieldErrorProps) => {
    return <Aria.FieldError {...props} className={cn(fieldError(), className)} />
}

const fieldGroupStyles = tv({
    base: [
        'group flex h-10 items-center overflow-hidden rounded-lg border border-muted bg-background transition disabled:opacity-50 disabled:bg-muted',
        'focus-within:border-primary/85 focus-within:ring-4 focus-within:ring-primary/20',
        'focus-within:invalid:border-danger focus-within:invalid:ring-4 focus-within:invalid:ring-danger/20',
        'has-[.prefix]:pl-2.5 has-[.suffix]:pr-2.5 [&_svg]:size-4 has-[.attribute]:shrink-0 has-[.attribute]:text-muted-foreground',
    ],
    variants: {
        isInvalid: {
            true: 'border-danger',
        },
    },
})

const FieldGroup = ({ className, ...props }: Aria.GroupProps) => {
    return (
        <Aria.Group
            {...props}
            className={Aria.composeRenderProps(className, (className, renderProps) =>
                fieldGroupStyles({ ...renderProps, className }),
            )}
        />
    )
}

const Input = React.forwardRef<HTMLInputElement, Aria.InputProps>(({ className, ...props }, ref) => {
    return <Aria.Input ref={ref} {...props} className={cn(input(), className)} />
})
Input.displayName = 'Input'

export {
    Description,
    fieldBorderStyles,
    FieldError,
    FieldGroup,
    fieldGroupPrefixStyles,
    fieldGroupStyles,
    Input,
    Label,
    type FieldProps,
}
