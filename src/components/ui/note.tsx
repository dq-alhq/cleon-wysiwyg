'use client'

import * as React from 'react'
import { IconCircleAlert, IconCircleCheck, IconTriangleAlert } from 'cleon-icons'
import { Text } from 'react-aria-components'
import { tv, type VariantProps } from 'tailwind-variants'

const noteStyles = tv({
    base: [
        'my-4 px-4 [&_.nd]:block [&_.nd]:text-sm py-4 leading-4 overflow-hidden rounded-lg border [&_strong]:font-medium',
        '[&_svg]:size-5 [&_svg]:shrink-0 [&_a]:underline [&_a]:hover:underline',
    ],
    variants: {
        variant: {
            primary: ['border-primary/35 [&_a]:text-primary text-primary bg-primary/10 leading-4'],
            secondary: [
                'border-border [&_a]:text-secondary-foreground text-secondary-foreground bg-secondary/50 [&_svg]:text-secondary-foreground',
                'dark:[&_a]:text-secondary-foreground dark:[&_svg]:text-secondary-foreground',
            ],
            info: ['border-info/20 text-info bg-info/5 dark:bg-info/10 leading-4'],
            warning: 'border-warning/50 dark:border-warning/25 bg-warning/5 text-warning dark:text-warning',
            danger: 'border-danger/30 bg-danger/5 dark:bg-danger/10 text-danger',
            success: ['border-success/20 [&_a]:text-success text-success bg-success/10 [&_svg]:text-success leading-4'],
        },
    },
    defaultVariants: {
        variant: 'primary',
    },
})

interface NoteProps extends React.HtmlHTMLAttributes<HTMLDivElement>, VariantProps<typeof noteStyles> {
    hideIndicator?: boolean
}

const Note = ({ hideIndicator = false, variant = 'primary', className, ...props }: NoteProps) => {
    return (
        <div className={noteStyles({ variant, className })} {...props}>
            <div className='flex items-start gap-x-2.5'>
                {!hideIndicator && (
                    <div className='w-5 shrink-0 mt-px'>
                        {['info', 'primary', 'secondary'].includes(variant) ? (
                            <IconCircleAlert />
                        ) : variant === 'success' ? (
                            <IconCircleCheck />
                        ) : (
                            <IconTriangleAlert />
                        )}
                    </div>
                )}
                <Text slot='description' {...props} className='nd'>
                    {props.children}
                </Text>
            </div>
        </div>
    )
}

export { Note, type NoteProps }
