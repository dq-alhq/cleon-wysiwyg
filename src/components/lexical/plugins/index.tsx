import React from 'react'
import {
    IconBold,
    IconCodeXml,
    IconHighlighter,
    IconItalic,
    IconRedo,
    IconStrikethrough,
    IconSubscript,
    IconSuperscript,
    IconUnderline,
    IconUndo,
} from 'cleon-icons'
import {
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    ElementFormatType,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical'
import { Toolbar } from '@/components/ui'
import { $isAutoLinkNode, $isLinkNode } from '@lexical/link'
import { $isListNode, ListNode } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isHeadingNode } from '@lexical/rich-text'
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils'
import { Alignment } from './alignment'
import { BlockType } from './block-type'
import { ClearFormatting } from './clear-formatting'
import { InsertImage } from './image-handler'
import { ToggleLink } from './link-handler'
import { InsertTable } from './table-handler'

export function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()
    const [blockType, setBlockType] = React.useState<string>('paragraph')
    const [formatText, setFormatText] = React.useState({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        subscript: false,
        superscript: false,
        code: false,
        highlight: false,
    })
    const [isLink, setIsLink] = React.useState<string>('')
    const [canUndo, setCanUndo] = React.useState<boolean>(false)
    const [canRedo, setCanRedo] = React.useState<boolean>(false)
    const [isRTL, setIsRTL] = React.useState<boolean>(false)
    const [align, setAlign] = React.useState<ElementFormatType>('left')

    const $updateToolbar = React.useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            setFormatText({
                bold: selection.hasFormat('bold'),
                italic: selection.hasFormat('italic'),
                underline: selection.hasFormat('underline'),
                strikethrough: selection.hasFormat('strikethrough'),
                subscript: selection.hasFormat('subscript'),
                superscript: selection.hasFormat('superscript'),
                code: selection.hasFormat('code'),
                highlight: selection.hasFormat('highlight'),
            })

            const anchorNode = selection.anchor.getNode()

            if ($isLinkNode(anchorNode.getParent())) {
                if ($isAutoLinkNode(anchorNode.getParent())) {
                    setIsLink('auto')
                } else {
                    setIsLink('link')
                }
            } else {
                setIsLink('')
            }

            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                          const parent = e.getParent()
                          return parent !== null && $isRootOrShadowRoot(parent)
                      })

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow()
            }

            const elementDOM = editor.getElementByKey(element.getKey())

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode)
                    const type = parentList ? parentList.getListType() : element.getListType()
                    setBlockType(type)
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType()
                    setBlockType(type)
                }
            }

            if ($isElementNode(element)) {
                setAlign(element.getFormatType())
                setIsRTL(element.getDirection() === 'rtl')
            }
        }
    }, [editor])

    React.useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateToolbar()
                    return false
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar()
                })
            }),
        )
    }, [editor, $updateToolbar])

    React.useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload)
                    return false
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload)
                    return false
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        )
    }, [editor])

    return (
        <Toolbar aria-label='Toolbar' orientation='horizontal' className='p-1 overflow-x-auto'>
            <Toolbar.Group aria-label='Blocks'>
                <ClearFormatting />
                <BlockType blockType={blockType} />
            </Toolbar.Group>
            <Toolbar.Separator />
            <Toolbar.Group aria-label='Formats'>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.bold}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
                    }}
                >
                    <IconBold />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.italic}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
                    }}
                >
                    <IconItalic />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.underline}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
                    }}
                >
                    <IconUnderline />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.strikethrough}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
                    }}
                >
                    <IconStrikethrough />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.subscript}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
                    }}
                >
                    <IconSubscript />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.superscript}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
                    }}
                >
                    <IconSuperscript />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.code}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
                    }}
                >
                    <IconCodeXml />
                </Toolbar.Item>
                <Toolbar.Item
                    isDisabled={!editor.isEditable()}
                    size='icon'
                    isSelected={formatText.highlight}
                    onChange={() => {
                        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')
                    }}
                >
                    <IconHighlighter />
                </Toolbar.Item>
            </Toolbar.Group>
            <Toolbar.Separator />
            <Toolbar.Group aria-label='Insert'>
                <ToggleLink isLink={isLink} />
                <InsertTable />
                <InsertImage />
            </Toolbar.Group>
            <Toolbar.Separator />
            <Alignment isRTL={isRTL} isDisabled={!editor.isEditable()} align={align} />
            <Toolbar.Separator />
            <Toolbar.Group aria-label='Actions'>
                <Toolbar.Item
                    size='icon'
                    isDisabled={!canUndo || !editor.isEditable()}
                    isSelected={false}
                    onPress={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                >
                    <IconUndo />
                </Toolbar.Item>
                <Toolbar.Item
                    size='icon'
                    isDisabled={!canRedo || !editor.isEditable()}
                    isSelected={false}
                    onPress={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                >
                    <IconRedo />
                </Toolbar.Item>
            </Toolbar.Group>
        </Toolbar>
    )
}
