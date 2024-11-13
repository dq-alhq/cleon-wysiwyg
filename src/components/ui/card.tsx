import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                'bg-background card rounded-xl [&:has(table)_.footer]:border-t [&:has(table)_.th]:bg-background [&:has(table)]:overflow-hidden border text-foreground shadow-sm [&_table]:overflow-hidden',
                className,
            )}
            {...props}
        />
    )
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    withoutPadding?: boolean
}

const Header = ({ withoutPadding = false, className, title, description, children, ...props }: HeaderProps) => (
    <div className={cn('flex flex-col space-y-1.5 px-6 py-5', withoutPadding && 'px-0 pt-0', className)} {...props}>
        {title && <Title>{title}</Title>}
        {description && <Description>{description}</Description>}
        {!title && typeof children === 'string' ? <Title>{children}</Title> : children}
    </div>
)

const Title = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h3 className={cn('sm:leading-6 leading-none font-semibold tracking-tight', className)} {...props} />
}

const Description = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            {...props}
            slot='description'
            className={cn('text-base text-muted-foreground sm:text-sm', className)}
            {...props}
        />
    )
}

const Content = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div
            className={cn(
                'px-6 pb-6 has-[.t-hea]:bg-secondary/40 has-[table]:p-0 [&:has(table)+.footer]:py-5 [&:has(table)]:border-t',
                className,
            )}
            {...props}
        />
    )
}

const Footer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn('footer flex items-center p-6 pt-0', className)} {...props} />
}

Card.Content = Content
Card.Description = Description
Card.Footer = Footer
Card.Header = Header
Card.Title = Title

export { Card }
