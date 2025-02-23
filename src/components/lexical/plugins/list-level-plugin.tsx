import React from 'react'
import {
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    BaseSelection,
    COMMAND_PRIORITY_HIGH,
    INDENT_CONTENT_COMMAND,
    type LexicalNode,
} from 'lexical'
import { $getListDepth, $isListItemNode, $isListNode } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

function getElementNodesInSelection(selection: BaseSelection) {
    const nodesInSelection = selection.getNodes()

    // if (nodesInSelection.length === 0) {
    //     return new Set([selection.anchor.getNode().getParentOrThrow(), selection.focus.getNode().getParentOrThrow()])
    // }

    return new Set(nodesInSelection.map((n: LexicalNode) => ($isElementNode(n) ? n : n.getParentOrThrow())))
}

function isIndentPermitted(maxDepth: number) {
    const selection: BaseSelection | null = $getSelection()

    if (!$isRangeSelection(selection)) {
        return false
    }

    const elementNodesInSelection = getElementNodesInSelection(selection)

    let totalDepth = 0
    for (const elementNode of elementNodesInSelection) {
        if ($isListNode(elementNode)) {
            totalDepth = Math.max($getListDepth(elementNode) + 1, totalDepth)
        } else if ($isListItemNode(elementNode)) {
            const parent = elementNode.getParent()
            if (!$isListNode(parent)) {
                throw new Error('ListMaxIndentLevelPlugin: A ListItemNode must have a ListNode for a parent.')
            }
            totalDepth = Math.max($getListDepth(parent) + 1, totalDepth)
        }
    }
    return totalDepth <= maxDepth
}

export function ListMaxIndentLevelPlugin(data: { maxDepth?: number }) {
    const [editor] = useLexicalComposerContext()
    React.useEffect(
        () =>
            editor.registerCommand(
                INDENT_CONTENT_COMMAND,
                () => !isIndentPermitted(data.maxDepth ?? 7),
                COMMAND_PRIORITY_HIGH,
            ),
        [editor, data.maxDepth],
    )
    return null
}
