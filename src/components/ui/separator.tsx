'use client'

import * as Aria from 'react-aria-components'
import { tv } from 'tailwind-variants'

const separatorStyles = tv({
    base: 'bg-muted shrink-0',
    variants: {
        orientation: {
            horizontal: 'h-px w-full',
            vertical: 'w-px',
        },
    },
    defaultVariants: {
        orientation: 'horizontal',
    },
})

const Separator = ({ className, ...props }: Aria.SeparatorProps) => (
    <Aria.Separator
        {...props}
        className={separatorStyles({
            orientation: props.orientation,
            className: className,
        })}
    />
)

export { Separator }
