import { IconTypographyX } from 'cleon-icons'
import { $createParagraphNode, $getSelection, $isRangeSelection, $isTextNode, LexicalEditor } from 'lexical'
import { Toolbar } from '@/components/ui'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text'
import { $isTableSelection } from '@lexical/table'
import { $getNearestBlockElementAncestorOrThrow } from '@lexical/utils'

export const clearFormatting = (editor: LexicalEditor) => {
    editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            const anchor = selection.anchor
            const focus = selection.focus
            const nodes = selection.getNodes()
            const extractedNodes = selection.extract()

            if (anchor.key === focus.key && anchor.offset === focus.offset) {
                return
            }

            nodes.forEach((node, idx) => {
                if ($isTextNode(node)) {
                    let textNode = node
                    if (idx === 0 && anchor.offset !== 0) {
                        textNode = textNode.splitText(anchor.offset)[1] || textNode
                    }
                    if (idx === nodes.length - 1) {
                        textNode = textNode.splitText(focus.offset)[0] || textNode
                    }

                    const extractedTextNode = extractedNodes[0]
                    if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
                        textNode = extractedTextNode
                    }

                    if (textNode.__style !== '') {
                        textNode.setStyle('')
                    }
                    if (textNode.__format !== 0) {
                        textNode.setFormat(0)
                        $getNearestBlockElementAncestorOrThrow(textNode).setFormat('')
                    }
                    node = textNode
                } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
                    node.replace($createParagraphNode(), true)
                } else if ($isDecoratorBlockNode(node)) {
                    node.setFormat('')
                }
            })
        }
    })
}

export function ClearFormatting() {
    const [editor] = useLexicalComposerContext()
    return (
        <Toolbar.Item
            isSelected={false}
            size='icon'
            isDisabled={!editor.isEditable()}
            onChange={() => clearFormatting(editor)}
        >
            <IconTypographyX />
        </Toolbar.Item>
    )
}
