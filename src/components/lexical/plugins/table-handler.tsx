import React from 'react'
import {
    IconPanelBottomOpen,
    IconPanelLeftOpen,
    IconPanelRightOpen,
    IconPanelTopOpen,
    IconRectangleEllipsis,
    IconTable,
    IconTableCellsMerge,
    IconTableCellsSplit,
    IconTrash,
} from 'cleon-icons'
import type { ElementNode, LexicalEditor } from 'lexical'
import {
    $createParagraphNode,
    $getNearestNodeFromDOMNode,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    $isTextNode,
} from 'lexical'
import { Collection } from 'react-aria-components'
import { createPortal } from 'react-dom'
import { ContextMenu, Popover, toggleStyles } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TablePlugin as LexicalTable } from '@lexical/react/LexicalTablePlugin'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import type { TableDOMCell, TableMapType } from '@lexical/table'
import {
    $computeTableMapSkipCellCheck,
    $deleteTableColumn__EXPERIMENTAL,
    $deleteTableRow__EXPERIMENTAL,
    $getNodeTriplet,
    $getTableCellNodeFromLexicalNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $getTableRowIndexFromTableCellNode,
    $insertTableColumn__EXPERIMENTAL,
    $insertTableRow__EXPERIMENTAL,
    $isTableCellNode,
    $isTableRowNode,
    $isTableSelection,
    $unmergeCell,
    getDOMCellFromTarget,
    getTableObserverFromTableElement,
    HTMLTableElementWithWithTableSelectionState,
    INSERT_TABLE_COMMAND,
    TableCellNode,
    TableNode,
    TableSelection,
} from '@lexical/table'
import { calculateZoomLevel } from '@lexical/utils'

export function TablePlugin() {
    return (
        <>
            <TableCellActionMenuContainer cellMerge={true} />
            <TableCellResizerPlugin />
            <LexicalTable />
        </>
    )
}

function computeSelectionCount(selection: TableSelection): {
    columns: number
    rows: number
} {
    const selectionShape = selection.getShape()
    return {
        columns: selectionShape.toX - selectionShape.fromX + 1,
        rows: selectionShape.toY - selectionShape.fromY + 1,
    }
}

function $canUnmerge(): boolean {
    const selection = $getSelection()
    if (
        ($isRangeSelection(selection) && !selection.isCollapsed()) ||
        ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
        (!$isRangeSelection(selection) && !$isTableSelection(selection))
    ) {
        return false
    }
    const [cell] = $getNodeTriplet(selection.anchor)
    return cell.__colSpan > 1 || cell.__rowSpan > 1
}

function $cellContainsEmptyParagraph(cell: TableCellNode): boolean {
    if (cell.getChildrenSize() !== 1) {
        return false
    }
    const firstChild = cell.getFirstChildOrThrow()
    if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
        return false
    }
    return true
}

function $selectLastDescendant(node: ElementNode): void {
    const lastDescendant = node.getLastDescendant()
    if ($isTextNode(lastDescendant)) {
        lastDescendant.select()
    } else if ($isElementNode(lastDescendant)) {
        lastDescendant.selectEnd()
    } else if (lastDescendant !== null) {
        lastDescendant.selectNext()
    }
}

type TableCellActionMenuProps = Readonly<{
    onClose: () => void
    setIsMenuOpen: (isOpen: boolean) => void
    tableCellNode: TableCellNode
    cellMerge: boolean
}>

function TableActionMenu({ onClose, tableCellNode: _tableCellNode, cellMerge }: TableCellActionMenuProps) {
    const [editor] = useLexicalComposerContext()
    const [tableCellNode, updateTableCellNode] = React.useState(_tableCellNode)
    const [selectionCounts, updateSelectionCounts] = React.useState({
        columns: 1,
        rows: 1,
    })
    const [canMergeCells, setCanMergeCells] = React.useState(false)
    const [canUnmergeCell, setCanUnmergeCell] = React.useState(false)

    React.useEffect(() => {
        return editor.registerMutationListener(
            TableCellNode,
            (nodeMutations) => {
                const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === 'updated'

                if (nodeUpdated) {
                    editor.getEditorState().read(() => {
                        updateTableCellNode(tableCellNode.getLatest())
                    })
                }
            },
            { skipInitialization: true },
        )
    }, [editor, tableCellNode])

    React.useEffect(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection()
            if ($isTableSelection(selection)) {
                const currentSelectionCounts = computeSelectionCount(selection)
                updateSelectionCounts(computeSelectionCount(selection))
                setCanMergeCells(currentSelectionCounts.columns > 1 || currentSelectionCounts.rows > 1)
            }
            setCanUnmergeCell($canUnmerge())
        })
    }, [editor])

    const clearTableSelection = React.useCallback(() => {
        editor.update(() => {
            if (tableCellNode.isAttached()) {
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
                const tableElement = editor.getElementByKey(
                    tableNode.getKey(),
                ) as HTMLTableElementWithWithTableSelectionState

                if (!tableElement) {
                    throw new Error('Expected to find tableElement in DOM')
                }

                const tableObserver = getTableObserverFromTableElement(tableElement)
                if (tableObserver !== null) {
                    tableObserver.clearHighlight()
                }

                tableNode.markDirty()
                updateTableCellNode(tableCellNode.getLatest())
            }
            const rootNode = $getRoot()
            rootNode.selectStart()
        })
    }, [editor, tableCellNode])

    const mergeTableCellsAtSelection = () => {
        editor.update(() => {
            const selection = $getSelection()
            if ($isTableSelection(selection)) {
                const { columns, rows } = computeSelectionCount(selection)
                const nodes = selection.getNodes()
                let firstCell: null | TableCellNode = null
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i]
                    if ($isTableCellNode(node)) {
                        if (firstCell === null) {
                            node.setColSpan(columns).setRowSpan(rows)
                            firstCell = node
                            const isEmpty = $cellContainsEmptyParagraph(node)
                            let firstChild
                            if (isEmpty && $isParagraphNode((firstChild = node.getFirstChild()))) {
                                firstChild.remove()
                            }
                        } else if ($isTableCellNode(firstCell)) {
                            const isEmpty = $cellContainsEmptyParagraph(node)
                            if (!isEmpty) {
                                firstCell.append(...node.getChildren())
                            }
                            node.remove()
                        }
                    }
                }
                if (firstCell !== null) {
                    if (firstCell.getChildrenSize() === 0) {
                        firstCell.append($createParagraphNode())
                    }
                    $selectLastDescendant(firstCell)
                }
                onClose()
            }
        })
    }

    const unmergeTableCellsAtSelection = () => {
        editor.update(() => {
            $unmergeCell()
        })
    }

    const insertTableRowAtSelection = React.useCallback(
        (shouldInsertAfter: boolean) => {
            editor.update(() => {
                $insertTableRow__EXPERIMENTAL(shouldInsertAfter)
                onClose()
            })
        },
        [editor, onClose],
    )

    const insertTableColumnAtSelection = React.useCallback(
        (shouldInsertAfter: boolean) => {
            editor.update(() => {
                for (let i = 0; i < selectionCounts.columns; i++) {
                    $insertTableColumn__EXPERIMENTAL(shouldInsertAfter)
                }
                onClose()
            })
        },
        [editor, onClose, selectionCounts.columns],
    )

    const deleteTableRowAtSelection = React.useCallback(() => {
        editor.update(() => {
            $deleteTableRow__EXPERIMENTAL()
            onClose()
        })
    }, [editor, onClose])

    const deleteTableAtSelection = React.useCallback(() => {
        editor.update(() => {
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
            tableNode.remove()

            clearTableSelection()
            onClose()
        })
    }, [editor, tableCellNode, clearTableSelection, onClose])

    const deleteTableColumnAtSelection = React.useCallback(() => {
        editor.update(() => {
            $deleteTableColumn__EXPERIMENTAL()
            onClose()
        })
    }, [editor, onClose])

    let mergeCellButton: null | JSX.Element = null
    if (cellMerge) {
        if (canMergeCells) {
            mergeCellButton = (
                <ContextMenu.Item onAction={mergeTableCellsAtSelection}>
                    <IconTableCellsMerge /> Merge Cells
                </ContextMenu.Item>
            )
        } else if (canUnmergeCell) {
            mergeCellButton = (
                <ContextMenu.Item onAction={unmergeTableCellsAtSelection}>
                    <IconTableCellsSplit /> Unmerge Cells
                </ContextMenu.Item>
            )
        }
    }

    return (
        <>
            {mergeCellButton}
            <ContextMenu.Item onAction={() => insertTableRowAtSelection(false)}>
                <IconPanelBottomOpen /> Insert Row Above
            </ContextMenu.Item>
            <ContextMenu.Item onAction={() => insertTableRowAtSelection(true)}>
                <IconPanelTopOpen /> Insert Row Below
            </ContextMenu.Item>
            <ContextMenu.Item onAction={() => insertTableColumnAtSelection(false)}>
                <IconPanelRightOpen /> Insert Column Left
            </ContextMenu.Item>
            <ContextMenu.Item onAction={() => insertTableColumnAtSelection(true)}>
                <IconPanelLeftOpen /> Insert Column Right
            </ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item onAction={deleteTableRowAtSelection}>
                <IconRectangleEllipsis /> Delete Row
            </ContextMenu.Item>
            <ContextMenu.Item onAction={deleteTableColumnAtSelection}>
                <IconRectangleEllipsis className='rotate-90' /> Delete Column
            </ContextMenu.Item>
            <ContextMenu.Item onAction={deleteTableAtSelection}>
                <IconTrash /> Delete Table
            </ContextMenu.Item>
        </>
    )
}

function TableCellActionMenuContainer({ cellMerge }: { cellMerge: boolean }): JSX.Element {
    const [editor] = useLexicalComposerContext()
    const [tableCellNode, setTableMenuCellNode] = React.useState<TableCellNode | null>(null)
    const [menuAnchorPosition, setMenuAnchorPosition] = React.useState<{
        top: number
        left: number
        width: number
        height: number
    } | null>(null)

    const $moveMenu = React.useCallback(() => {
        const selection = $getSelection()
        const nativeSelection = window.getSelection()
        const activeElement = document.activeElement

        if (selection == null) {
            setTableMenuCellNode(null)
            return
        }

        const rootElement = editor.getRootElement()

        if (
            $isRangeSelection(selection) &&
            rootElement !== null &&
            nativeSelection !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(selection.anchor.getNode())

            if (tableCellNodeFromSelection == null) {
                setTableMenuCellNode(null)
                return
            }

            const tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey())

            if (tableCellParentNodeDOM == null) {
                setTableMenuCellNode(null)
                return
            }
            setTableMenuCellNode(tableCellNodeFromSelection)

            setMenuAnchorPosition({
                top: tableCellParentNodeDOM.getBoundingClientRect().top,
                left: tableCellParentNodeDOM.getBoundingClientRect().left,
                width: tableCellParentNodeDOM.getBoundingClientRect().width,
                height: tableCellParentNodeDOM.getBoundingClientRect().height,
            })
        } else if (!activeElement) {
            setTableMenuCellNode(null)
        }
    }, [editor])

    React.useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                $moveMenu()
            })
        })
    })

    return (
        <>
            {tableCellNode != null && (
                <ContextMenu>
                    <ContextMenu.Trigger
                        className='absolute transition bg-primary/20'
                        style={{
                            top: menuAnchorPosition?.top,
                            left: menuAnchorPosition?.left,
                            width: menuAnchorPosition?.width,
                            height: menuAnchorPosition?.height,
                        }}
                    ></ContextMenu.Trigger>
                    <ContextMenu.Content aria-label='Actions'>
                        <TableActionMenu
                            onClose={() => setTableMenuCellNode(null)}
                            setIsMenuOpen={() => setTableMenuCellNode(null)}
                            tableCellNode={tableCellNode}
                            cellMerge={cellMerge}
                        />
                    </ContextMenu.Content>
                </ContextMenu>
            )}
        </>
    )
}

type MousePosition = {
    x: number
    y: number
}

type MouseDraggingDirection = 'right' | 'bottom'

const MIN_ROW_HEIGHT = 33
const MIN_COLUMN_WIDTH = 92

function TableCellResizer({ editor }: { editor: LexicalEditor }): JSX.Element {
    const targetRef = React.useRef<HTMLElement | null>(null)
    const resizerRef = React.useRef<HTMLDivElement | null>(null)
    const tableRectRef = React.useRef<ClientRect | null>(null)

    const mouseStartPosRef = React.useRef<MousePosition | null>(null)
    const [mouseCurrentPos, updateMouseCurrentPos] = React.useState<MousePosition | null>(null)

    const [activeCell, updateActiveCell] = React.useState<TableDOMCell | null>(null)
    const [isMouseDown, updateIsMouseDown] = React.useState<boolean>(false)
    const [draggingDirection, updateDraggingDirection] = React.useState<MouseDraggingDirection | null>(null)

    const resetState = React.useCallback(() => {
        updateActiveCell(null)
        targetRef.current = null
        updateDraggingDirection(null)
        mouseStartPosRef.current = null
        tableRectRef.current = null
    }, [])

    const isMouseDownOnEvent = (event: MouseEvent) => {
        return (event.buttons & 1) === 1
    }

    React.useEffect(() => {
        return editor.registerNodeTransform(TableNode, (tableNode) => {
            if (tableNode.getColWidths()) {
                return tableNode
            }

            const numColumns = tableNode.getColumnCount()
            const columnWidth = MIN_COLUMN_WIDTH

            tableNode.setColWidths(Array(numColumns).fill(columnWidth))
            return tableNode
        })
    }, [editor])

    React.useEffect(() => {
        const onMouseMove = (event: MouseEvent) => {
            setTimeout(() => {
                const target = event.target

                if (draggingDirection) {
                    updateMouseCurrentPos({
                        x: event.clientX,
                        y: event.clientY,
                    })
                    return
                }
                updateIsMouseDown(isMouseDownOnEvent(event))
                if (resizerRef.current && resizerRef.current.contains(target as Node)) {
                    return
                }

                if (targetRef.current !== target) {
                    targetRef.current = target as HTMLElement
                    const cell = getDOMCellFromTarget(target as HTMLElement)

                    if (cell && activeCell !== cell) {
                        editor.update(() => {
                            const tableCellNode = $getNearestNodeFromDOMNode(cell.elem)
                            if (!tableCellNode) {
                                throw new Error('TableCellResizer: Table cell node not found.')
                            }

                            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
                            const tableElement = editor.getElementByKey(tableNode.getKey())

                            if (!tableElement) {
                                throw new Error('TableCellResizer: Table element not found.')
                            }

                            targetRef.current = target as HTMLElement
                            tableRectRef.current = tableElement.getBoundingClientRect()
                            updateActiveCell(cell)
                        })
                    } else if (cell == null) {
                        resetState()
                    }
                }
            }, 0)
        }

        const onMouseDown = () => {
            setTimeout(() => {
                updateIsMouseDown(true)
            }, 0)
        }

        const onMouseUp = () => {
            setTimeout(() => {
                updateIsMouseDown(false)
            }, 0)
        }

        const removeRootListener = editor.registerRootListener((rootElement, prevRootElement) => {
            prevRootElement?.removeEventListener('mousemove', onMouseMove)
            prevRootElement?.removeEventListener('mousedown', onMouseDown)
            prevRootElement?.removeEventListener('mouseup', onMouseUp)
            rootElement?.addEventListener('mousemove', onMouseMove)
            rootElement?.addEventListener('mousedown', onMouseDown)
            rootElement?.addEventListener('mouseup', onMouseUp)
        })

        return () => {
            removeRootListener()
        }
    }, [activeCell, draggingDirection, editor, resetState])

    const isHeightChanging = (direction: MouseDraggingDirection) => {
        if (direction === 'bottom') {
            return true
        }
        return false
    }

    const updateRowHeight = React.useCallback(
        (heightChange: number) => {
            if (!activeCell) {
                throw new Error('TableCellResizer: Expected active cell.')
            }

            editor.update(
                () => {
                    const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem)
                    if (!$isTableCellNode(tableCellNode)) {
                        throw new Error('TableCellResizer: Table cell node not found.')
                    }

                    const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)

                    const tableRowIndex =
                        $getTableRowIndexFromTableCellNode(tableCellNode) + tableCellNode.getRowSpan() - 1

                    const tableRows = tableNode.getChildren()

                    if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
                        throw new Error('Expected table cell to be inside of table row.')
                    }

                    const tableRow = tableRows[tableRowIndex]

                    if (!$isTableRowNode(tableRow)) {
                        throw new Error('Expected table row')
                    }

                    let height = tableRow.getHeight()
                    if (height === undefined) {
                        const rowCells = tableRow.getChildren<TableCellNode>()
                        height = Math.min(...rowCells.map((cell) => getCellNodeHeight(cell, editor) ?? Infinity))
                    }

                    const newHeight = Math.max(height + heightChange, MIN_ROW_HEIGHT)
                    tableRow.setHeight(newHeight)
                },
                { tag: 'skip-scroll-into-view' },
            )
        },
        [activeCell, editor],
    )

    const getCellNodeHeight = (cell: TableCellNode, activeEditor: LexicalEditor): number | undefined => {
        const domCellNode = activeEditor.getElementByKey(cell.getKey())
        return domCellNode?.clientHeight
    }

    const getCellColumnIndex = (tableCellNode: TableCellNode, tableMap: TableMapType) => {
        for (let row = 0; row < tableMap.length; row++) {
            for (let column = 0; column < tableMap[row].length; column++) {
                if (tableMap[row][column].cell === tableCellNode) {
                    return column
                }
            }
        }
    }

    const updateColumnWidth = React.useCallback(
        (widthChange: number) => {
            if (!activeCell) {
                throw new Error('TableCellResizer: Expected active cell.')
            }
            editor.update(
                () => {
                    const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem)
                    if (!$isTableCellNode(tableCellNode)) {
                        throw new Error('TableCellResizer: Table cell node not found.')
                    }

                    const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode)
                    const [tableMap] = $computeTableMapSkipCellCheck(tableNode, null, null)
                    const columnIndex = getCellColumnIndex(tableCellNode, tableMap)
                    if (columnIndex === undefined) {
                        throw new Error('TableCellResizer: Table column not found.')
                    }

                    const colWidths = tableNode.getColWidths()
                    if (!colWidths) {
                        return
                    }
                    const width = colWidths[columnIndex]
                    if (width === undefined) {
                        return
                    }
                    const newColWidths = [...colWidths]
                    const newWidth = Math.max(width + widthChange, MIN_COLUMN_WIDTH)
                    newColWidths[columnIndex] = newWidth
                    tableNode.setColWidths(newColWidths)
                },
                { tag: 'skip-scroll-into-view' },
            )
        },
        [activeCell, editor],
    )

    const mouseUpHandler = React.useCallback(
        (direction: MouseDraggingDirection) => {
            const handler = (event: MouseEvent) => {
                event.preventDefault()
                event.stopPropagation()

                if (!activeCell) {
                    throw new Error('TableCellResizer: Expected active cell.')
                }

                if (mouseStartPosRef.current) {
                    const { x, y } = mouseStartPosRef.current

                    if (activeCell === null) {
                        return
                    }
                    const zoom = calculateZoomLevel(event.target as Element)

                    if (isHeightChanging(direction)) {
                        const heightChange = (event.clientY - y) / zoom
                        updateRowHeight(heightChange)
                    } else {
                        const widthChange = (event.clientX - x) / zoom
                        updateColumnWidth(widthChange)
                    }

                    resetState()
                    document.removeEventListener('mouseup', handler)
                }
            }
            return handler
        },
        [activeCell, resetState, updateColumnWidth, updateRowHeight],
    )

    const toggleResize = React.useCallback(
        (direction: MouseDraggingDirection): React.MouseEventHandler<HTMLDivElement> =>
            (event) => {
                event.preventDefault()
                event.stopPropagation()

                if (!activeCell) {
                    throw new Error('TableCellResizer: Expected active cell.')
                }

                mouseStartPosRef.current = {
                    x: event.clientX,
                    y: event.clientY,
                }
                updateMouseCurrentPos(mouseStartPosRef.current)
                updateDraggingDirection(direction)

                document.addEventListener('mouseup', mouseUpHandler(direction))
            },
        [activeCell, mouseUpHandler],
    )

    const getResizers = React.useCallback(() => {
        if (activeCell) {
            const { height, width, top, left } = activeCell.elem.getBoundingClientRect()
            const zoom = calculateZoomLevel(activeCell.elem)
            const zoneWidth = 10 // Pixel width of the zone where you can drag the edge
            const styles = {
                bottom: {
                    backgroundColor: 'none',
                    cursor: 'row-resize',
                    height: `${zoneWidth}px`,
                    left: `${window.pageXOffset + left}px`,
                    top: `${window.pageYOffset + top + height - zoneWidth / 2}px`,
                    width: `${width}px`,
                },
                right: {
                    backgroundColor: 'none',
                    cursor: 'col-resize',
                    height: `${height}px`,
                    left: `${window.pageXOffset + left + width - zoneWidth / 2}px`,
                    top: `${window.pageYOffset + top}px`,
                    width: `${zoneWidth}px`,
                },
            }

            const tableRect = tableRectRef.current

            if (draggingDirection && mouseCurrentPos && tableRect) {
                if (isHeightChanging(draggingDirection)) {
                    styles[draggingDirection].left = `${window.pageXOffset + tableRect.left}px`
                    styles[draggingDirection].top = `${window.pageYOffset + mouseCurrentPos.y / zoom}px`
                    styles[draggingDirection].height = '3px'
                    styles[draggingDirection].width = `${tableRect.width}px`
                } else {
                    styles[draggingDirection].top = `${window.pageYOffset + tableRect.top}px`
                    styles[draggingDirection].left = `${window.pageXOffset + mouseCurrentPos.x / zoom}px`
                    styles[draggingDirection].width = '3px'
                    styles[draggingDirection].height = `${tableRect.height}px`
                }

                styles[draggingDirection].backgroundColor = '#adf'
            }

            return styles
        }

        return {
            bottom: null,
            left: null,
            right: null,
            top: null,
        }
    }, [activeCell, draggingDirection, mouseCurrentPos])

    const resizerStyles = getResizers()

    return (
        <div ref={resizerRef}>
            {activeCell != null && !isMouseDown && (
                <>
                    <div
                        className='absolute'
                        style={resizerStyles.right || undefined}
                        onMouseDown={toggleResize('right')}
                    />
                    <div
                        className='absolute'
                        style={resizerStyles.bottom || undefined}
                        onMouseDown={toggleResize('bottom')}
                    />
                </>
            )}
        </div>
    )
}

export function TableCellResizerPlugin(): null | React.ReactPortal {
    const [editor] = useLexicalComposerContext()
    const isEditable = useLexicalEditable()

    return React.useMemo(
        () => (isEditable ? createPortal(<TableCellResizer editor={editor} />, document.body) : null),
        [editor, isEditable],
    )
}

export function InsertTable() {
    const columns = [1, 2, 3, 4, 5, 6]
    const rows = [1, 2, 3, 4, 5, 6]
    const grids = columns.map((col) => rows.map((row) => `${col}x${row}`)).flat()

    const [colHovered, setColHovered] = React.useState<number>(0)
    const [rowHovered, setRowHovered] = React.useState<number>(0)

    const [editor] = useLexicalComposerContext()

    function insertTable() {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: colHovered.toString(), columns: rowHovered.toString() })
        setColHovered(0)
        setRowHovered(0)
    }
    return (
        <Popover
            onOpenChange={() => {
                setColHovered(0)
                setRowHovered(0)
            }}
        >
            <Popover.Trigger className={toggleStyles({ size: 'icon' })}>
                <IconTable />
            </Popover.Trigger>
            <Popover.Content className='min-w-0 sm:p-2'>
                <Popover.Header>
                    <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>Insert Table</span>
                        <span className='text-sm font-semibold text-foreground'>
                            {rowHovered}×{colHovered}
                        </span>
                    </div>
                </Popover.Header>
                <Popover.Body className='grid grid-cols-6 gap-1'>
                    <Collection
                        aria-label='Grids'
                        items={Array.from({ length: grids.length }, (_, i) => ({ key: grids[i], label: grids[i] }))}
                    >
                        {(grid) => (
                            <button
                                onClick={insertTable}
                                onMouseOver={() => {
                                    setColHovered(Number(grid.key.split('x')[0]))
                                    setRowHovered(Number(grid.key.split('x')[1]))
                                }}
                                className={cn(
                                    'flex size-5 items-center outline-primary justify-center rounded bg-muted text-xs transition-all',
                                    {
                                        'bg-primary text-primary-foreground':
                                            rowHovered >= Number(grid.key.split('x')[1]) &&
                                            colHovered >= Number(grid.key.split('x')[0]),
                                    },
                                )}
                                key={grid.key}
                            />
                        )}
                    </Collection>
                </Popover.Body>
            </Popover.Content>
        </Popover>
    )
}
