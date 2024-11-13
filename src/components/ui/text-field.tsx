'use client'

import * as React from 'react'
import { IconLoaderCircle, IconLock, IconLockOpen } from 'cleon-icons'
import * as Aria from 'react-aria-components'
import { cn } from '@/lib/utils'
import type { TextInputDOMProps } from '@react-types/shared'
import type { FieldProps } from './field'
import { Description, FieldError, FieldGroup, fieldGroupPrefixStyles, Input, Label } from './field'
import { Loader } from './loader'

type InputType = Exclude<TextInputDOMProps['type'], 'password'>

interface BaseTextFieldProps extends Aria.TextFieldProps, FieldProps {
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    isPending?: boolean
    indicatorPlace?: 'prefix' | 'suffix'
    className?: string
}

interface RevealableTextFieldProps extends BaseTextFieldProps {
    isRevealable: true
    type: 'password'
}

interface NonRevealableTextFieldProps extends BaseTextFieldProps {
    isRevealable?: never
    type?: InputType
}

type TextFieldProps = RevealableTextFieldProps | NonRevealableTextFieldProps

const TextField = ({
    placeholder,
    label,
    description,
    errorMessage,
    prefix,
    suffix,
    isPending,
    indicatorPlace,
    className,
    isRevealable,
    type,
    ...props
}: TextFieldProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)
    const inputType = isRevealable ? (isPasswordVisible ? 'text' : 'password') : type

    const handleTogglePasswordVisibility = () => {
        setIsPasswordVisible((prev) => !prev)
    }
    return (
        <Aria.TextField type={inputType} {...props} className={cn('group flex flex-col gap-1', className)}>
            {label && <Label>{label}</Label>}
            <FieldGroup data-loading={isPending ? 'true' : undefined} className={fieldGroupPrefixStyles({ className })}>
                {isPending && indicatorPlace === 'prefix' ? (
                    <IconLoaderCircle className='animate-spin prefix' />
                ) : prefix ? (
                    <span className='attribute prefix x2e2'>{prefix}</span>
                ) : null}
                <Input className='px-2.5' placeholder={placeholder} />
                {isRevealable ? (
                    <Aria.Button
                        type='button'
                        onPress={handleTogglePasswordVisibility}
                        className='attribute relative suffix x2e2 [&_svg]:text-muted-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded'
                    >
                        <>{isPasswordVisible ? <IconLockOpen /> : <IconLock />}</>
                    </Aria.Button>
                ) : isPending && indicatorPlace === 'suffix' ? (
                    <Loader variant='spin' className='suffix' />
                ) : suffix ? (
                    <span className='attribute suffix x2e2'>{suffix}</span>
                ) : null}
            </FieldGroup>
            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>
        </Aria.TextField>
    )
}

export { TextField, type TextFieldProps }
