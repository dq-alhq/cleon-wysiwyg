import React from 'react'
import { IconImagePlus, IconImageUp, IconLink, IconLoaderCircle } from 'cleon-icons'
import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical'
import {
    $createParagraphNode,
    $insertNodes,
    $isRootOrShadowRoot,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    DecoratorNode,
    LexicalCommand,
} from 'lexical'
import { Button, Form, Popover, TextField, toggleStyles } from '@/components/ui'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils'

export type InsertImagePayload = Readonly<ImagePayload>

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND')

export function ImagesPlugin() {
    const [editor] = useLexicalComposerContext()
    React.useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagesPlugin: ImageNode not registered on editor')
        }
        return mergeRegister(
            editor.registerCommand<InsertImagePayload>(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createImageNode(payload)
                    $insertNodes([imageNode])
                    if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                        $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
                    }

                    return true
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        )
    }, [editor])
    return null
}

export interface ImagePayload {
    altText: string
    height?: number
    key?: NodeKey
    maxWidth?: number
    src: string
    width?: number
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
    if (domNode instanceof HTMLImageElement) {
        const { alt: altText, src } = domNode
        const node = $createImageNode({ altText, src })
        return { node }
    }
    return null
}

export type SerializedImageNode = Spread<
    {
        altText: string
        height?: number
        maxWidth: number
        src: string
        width?: number
        type: 'image'
        version: 1
    },
    SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string
    __altText: string
    __width: 'inherit' | number
    __height: 'inherit' | number
    __maxWidth: number

    static getType(): string {
        return 'image'
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__altText, node.__maxWidth, node.__width, node.__height, node.__key)
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { altText, height, width, maxWidth, src } = serializedNode
        return $createImageNode({
            altText,
            height,
            maxWidth,
            src,
            width,
        })
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img')
        element.setAttribute('src', this.__src)
        element.setAttribute('alt', this.__altText)
        return { element }
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: convertImageElement,
                priority: 0,
            }),
        }
    }

    constructor(
        src: string,
        altText: string,
        maxWidth: number,
        width?: 'inherit' | number,
        height?: 'inherit' | number,
        key?: NodeKey,
    ) {
        super(key)
        this.__src = src
        this.__altText = altText
        this.__maxWidth = maxWidth
        this.__width = width || 'inherit'
        this.__height = height || 'inherit'
    }

    exportJSON(): SerializedImageNode {
        return {
            altText: this.getAltText(),
            height: this.__height === 'inherit' ? 0 : this.__height,
            maxWidth: this.__maxWidth,
            src: this.getSrc(),
            type: 'image',
            version: 1,
            width: this.__width === 'inherit' ? 0 : this.__width,
        }
    }

    setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
        const writable = this.getWritable()
        writable.__width = width
        writable.__height = height
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span')
        const theme = config.theme
        const className = theme.image
        if (className !== undefined) {
            span.className = className
        }
        return span
    }

    updateDOM(): false {
        return false
    }

    getSrc(): string {
        return this.__src
    }

    getAltText(): string {
        return this.__altText
    }

    decorate(): JSX.Element {
        return (
            <React.Suspense fallback={null}>
                <ImageComponent
                    src={this.__src}
                    altText={this.__altText}
                    width={this.__width}
                    height={this.__height}
                    maxWidth={this.__maxWidth}
                    nodeKey={this.getKey()}
                    resizable={true}
                />
            </React.Suspense>
        )
    }
}

export function $createImageNode({ altText, height, maxWidth = 500, src, width, key }: ImagePayload): ImageNode {
    return new ImageNode(src, altText, maxWidth, width, height, key)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
    return node instanceof ImageNode
}

const imageCache = new Set()

function useSuspenseImage(src: string) {
    if (!imageCache.has(src)) {
        throw new Promise((resolve) => {
            const img = new Image()
            img.src = src
            img.onload = () => {
                imageCache.add(src)
                resolve(null)
            }
        })
    }
}

function LazyImage({
    altText,
    className,
    imageRef,
    src,
    width,
    height,
    maxWidth,
}: {
    altText: string
    className: string | null
    height: 'inherit' | number
    imageRef: { current: null | HTMLImageElement }
    maxWidth: number
    src: string
    width: 'inherit' | number
}): JSX.Element {
    useSuspenseImage(src)
    return (
        <img
            className={className || undefined}
            src={src}
            alt={altText}
            ref={imageRef}
            style={{
                height,
                maxWidth,
                width,
            }}
        />
    )
}

interface ImageComponentProps {
    altText: string
    height: 'inherit' | number
    maxWidth: number
    nodeKey: NodeKey
    resizable: boolean
    src: string
    width: 'inherit' | number
}

export function ImageComponent({ src, altText, width, height, maxWidth }: ImageComponentProps) {
    const imageRef = React.useRef<null | HTMLImageElement>(null)
    return (
        <React.Suspense fallback={<IconLoaderCircle className='size-64 animate-spin' />}>
            <LazyImage
                className='inline-flex rounded-lg text-wrap'
                src={src}
                altText={altText}
                imageRef={imageRef}
                width={width}
                height={height}
                maxWidth={maxWidth}
            />
        </React.Suspense>
    )
}

export function InsertImage() {
    const [editor] = useLexicalComposerContext()
    const insertImage = (payload: InsertImagePayload) => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
    }
    const [url, setUrl] = React.useState('')

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File is too big! > 2MB')
                return
            }
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => insertImage({ altText: 'URL image', src: reader.result as string })
        }
    }

    const handleAddImageUrl = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        insertImage({ altText: 'URL image', src: url })
        setUrl('')
    }
    return (
        <>
            <Popover>
                <Popover.Trigger className={toggleStyles({ size: 'icon' })}>
                    <IconImagePlus />
                </Popover.Trigger>
                <Popover.Content className='sm:p-2'>
                    <Popover.Header>
                        <Popover.Description>Insert image address</Popover.Description>
                    </Popover.Header>
                    <Popover.Body>
                        <Form onSubmit={handleAddImageUrl}>
                            <TextField
                                autoFocus
                                name='url'
                                placeholder='https://'
                                suffix={
                                    <Button type='submit'>
                                        <IconImagePlus />
                                    </Button>
                                }
                                prefix={<IconLink />}
                                aria-label='URL'
                                value={url}
                                onChange={setUrl}
                            />
                        </Form>
                        <Button
                            isDisabled={!editor.isEditable()}
                            size='sm'
                            onPress={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = (e) =>
                                    handleUpload(e as unknown as React.ChangeEvent<HTMLInputElement>)
                                input.click()
                            }}
                        >
                            or
                            <IconImageUp /> Upload Image
                        </Button>
                    </Popover.Body>
                </Popover.Content>
            </Popover>
        </>
    )
}
