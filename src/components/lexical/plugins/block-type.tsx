import {
    IconFileCode,
    IconHeading1,
    IconHeading2,
    IconHeading3,
    IconList,
    IconListChecks,
    IconListOrdered,
    IconParagraph,
    IconTextQuote,
} from 'cleon-icons'
import { $createParagraphNode, $getSelection } from 'lexical'
import { Menu, toggleStyles } from '@/components/ui'
import { $createCodeNode } from '@lexical/code'
import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { HeadingTagType } from '@lexical/rich-text'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'

export function BlockType({ blockType }: { blockType: string }) {
    const [editor] = useLexicalComposerContext()

    const formatHeading = (headingLevel: HeadingTagType) => {
        editor.update(() => {
            const selection = $getSelection()
            $setBlocksType(selection, () => $createHeadingNode(headingLevel))
        })
    }

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection()
            $setBlocksType(selection, () => $createParagraphNode())
        })
    }

    const formatOrderedList = () => {
        if (blockType !== 'number') {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        }
    }

    const formatUnorderedList = () => {
        if (blockType !== 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        }
    }

    const formatCheckList = () => {
        if (blockType !== 'check') {
            editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        }
    }

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection()
            $setBlocksType(selection, () => $createQuoteNode())
        })
    }

    const formatCode = () => {
        editor.update(() => {
            const selection = $getSelection()
            $setBlocksType(selection, () => $createCodeNode())
        })
    }

    const blockTypes = [
        { name: 'paragraph', icon: <IconParagraph />, label: 'Normal', onAction: formatParagraph },
        { name: 'h1', icon: <IconHeading1 />, label: 'Heading 1', onAction: () => formatHeading('h1') },
        { name: 'h2', icon: <IconHeading2 />, label: 'Heading 2', onAction: () => formatHeading('h2') },
        { name: 'h3', icon: <IconHeading3 />, label: 'Heading 3', onAction: () => formatHeading('h3') },
        { name: 'bullet', icon: <IconList />, label: 'Bullet List', onAction: formatUnorderedList },
        { name: 'number', icon: <IconListOrdered />, label: 'Number List', onAction: formatOrderedList },
        { name: 'check', icon: <IconListChecks />, label: 'Check List', onAction: formatCheckList },
        { name: 'quote', icon: <IconTextQuote />, label: 'Quote', onAction: formatQuote },
        { name: 'code', icon: <IconFileCode />, label: 'Code', onAction: formatCode },
    ]

    return (
        <Menu>
            <Menu.Trigger isDisabled={!editor.isEditable()} className={toggleStyles()}>
                {blockTypes.find((item) => item.name === blockType)?.icon}{' '}
                {blockTypes.find((item) => item.name === blockType)?.label}
            </Menu.Trigger>
            <Menu.Content selectionMode='single' aria-label='Block type' selectedKeys={[blockType]} items={blockTypes}>
                {(item) => (
                    <Menu.Radio id={item.name} key={item.name} onAction={item.onAction}>
                        {item.icon} {item.label}
                    </Menu.Radio>
                )}
            </Menu.Content>
        </Menu>
    )
}
