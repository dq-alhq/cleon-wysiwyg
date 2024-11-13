import React from 'react'
import {
    $getSelection,
    COMMAND_PRIORITY_NORMAL,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    INDENT_CONTENT_COMMAND,
    KEY_MODIFIER_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { $createCodeNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { clearFormatting } from './clear-formatting'

const controlOrMeta = (metaKey: boolean, ctrlKey: boolean) => metaKey || ctrlKey

function isFormatCode(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyC' && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey)
}

function isFormatQuote(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyQ' && !shiftKey && altKey && controlOrMeta(metaKey, ctrlKey)
}

function isStrikeThrough(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyS' && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isIndent(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'BracketRight' && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isOutdent(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'BracketLeft' && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isCenterAlign(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyE' && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isLeftAlign(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyL' && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isRightAlign(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyR' && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isJustifyAlign(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyJ' && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isSubscript(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'Comma' && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isSuperscript(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'Period' && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isInsertCodeBlock(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'KeyC' && shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

function isClearFormatting(event: KeyboardEvent): boolean {
    const { code, shiftKey, altKey, metaKey, ctrlKey } = event
    return code === 'Backslash' && !shiftKey && !altKey && controlOrMeta(metaKey, ctrlKey)
}

export function ShortcutsPlugin() {
    const [editor] = useLexicalComposerContext()
    React.useEffect(() => {
        const keyboardShortcutsHandler = (payload: KeyboardEvent) => {
            const event: KeyboardEvent = payload
            if (isFormatCode(event)) {
                event.preventDefault()
                editor.update(() => {
                    const selection = $getSelection()
                    $setBlocksType(selection, () => $createCodeNode())
                })
            } else if (isFormatQuote(event)) {
                event.preventDefault()
                editor.update(() => {
                    const selection = $getSelection()
                    $setBlocksType(selection, () => $createQuoteNode())
                })
            } else if (isStrikeThrough(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            } else if (isIndent(event)) {
                event.preventDefault()
                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)
            } else if (isOutdent(event)) {
                event.preventDefault()
                editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)
            } else if (isCenterAlign(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
            } else if (isLeftAlign(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
            } else if (isRightAlign(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
            } else if (isJustifyAlign(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
            } else if (isSubscript(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
            } else if (isSuperscript(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
            } else if (isInsertCodeBlock(event)) {
                event.preventDefault()
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
            } else if (isClearFormatting(event)) {
                event.preventDefault()
                clearFormatting(editor)
            }

            return false
        }

        return editor.registerCommand(KEY_MODIFIER_COMMAND, keyboardShortcutsHandler, COMMAND_PRIORITY_NORMAL)
    }, [editor])

    return null
}
