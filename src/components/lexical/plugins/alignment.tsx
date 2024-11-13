import React, { SVGProps } from 'react'
import { IconAlignCenter, IconAlignJustify, IconAlignLeft, IconAlignRight } from 'cleon-icons'
import { ElementFormatType, FORMAT_ELEMENT_COMMAND } from 'lexical'
import { Toolbar } from '@/components/ui'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

const ELEMENT_FORMAT_OPTIONS: Record<
    string,
    { icon: React.FC<SVGProps<SVGSVGElement>>; iconRTL: React.FC<SVGProps<SVGSVGElement>>; name: string }
> = {
    left: {
        icon: IconAlignLeft,
        iconRTL: IconAlignRight,
        name: 'Left Align',
    },
    center: {
        icon: IconAlignCenter,
        iconRTL: IconAlignCenter,
        name: 'Center Align',
    },
    right: {
        icon: IconAlignRight,
        iconRTL: IconAlignLeft,
        name: 'Right Align',
    },
    justify: {
        icon: IconAlignJustify,
        iconRTL: IconAlignJustify,
        name: 'Justify Align',
    },
}

export function Alignment({
    isDisabled,
    isRTL,
    align = 'left',
}: {
    isDisabled: boolean
    isRTL: boolean
    align: ElementFormatType
}) {
    const [editor] = useLexicalComposerContext()

    return (
        <Toolbar.Group isDisabled={isDisabled} aria-label='Alignment'>
            {Object.keys(ELEMENT_FORMAT_OPTIONS).map((key) => {
                const option = ELEMENT_FORMAT_OPTIONS[key]
                return (
                    <Toolbar.Item
                        size='icon'
                        key={key}
                        aria-label={option.name}
                        isSelected={align === key}
                        isDisabled={isDisabled}
                        onChange={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, key as ElementFormatType)
                        }}
                    >
                        {isRTL ? <option.iconRTL /> : <option.icon />}
                    </Toolbar.Item>
                )
            })}
        </Toolbar.Group>
    )
}
