import { cn } from '@/lib/utils'
import { $generateHtmlFromNodes } from '@lexical/html'
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { nodes } from './nodes'
import { ToolbarPlugin } from './plugins'
import { ImagesPlugin } from './plugins/image-handler'
import { LinkPlugin } from './plugins/link-handler'
import { ListMaxIndentLevelPlugin } from './plugins/list-level-plugin'
import { ShortcutsPlugin } from './plugins/shortcuts'
import TabFocusPlugin from './plugins/tab-focus-plugin'
import { TablePlugin } from './plugins/table-handler'
import { PLAYGROUND_TRANSFORMERS } from './plugins/transformers'
import { theme } from './theme'

function onError(error: Error): void {
    console.error(error)
}

interface RichTextFieldProps {
    name?: string
    valueHTML?: string
    valueMD?: string
    isDisabled?: boolean
    onChangeHTML?: (valueHTML: string) => void
    onChangeMD?: (valueMD: string) => void
}

function RichTextField({ isDisabled, ...props }: RichTextFieldProps) {
    const initialConfig = {
        editorState: () => $convertFromMarkdownString(props.valueMD ?? '', PLAYGROUND_TRANSFORMERS),
        namespace: props.name ?? 'rich-text-field',
        theme,
        nodes,
        onError,
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <ToolbarPlugin />
            <section className='relative -mt-4'>
                <RichTextPlugin
                    placeholder={<p className='absolute left-3 top-2 text-muted-foreground'>Write something...</p>}
                    contentEditable={
                        <ContentEditable
                            className={cn(
                                'min-h-32 w-full min-w-0 rounded-md border bg-background px-2.5 py-2 text-base shadow-sm outline-none transition focus:outline-none sm:text-sm',
                                'focus:border-primary/85 focus:ring-4 focus:ring-primary/20',
                                'invalid:border-danger invalid:ring-4 invalid:ring-danger/20',
                                isDisabled && 'bg-muted opacity-50',
                            )}
                        />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </section>
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <ListMaxIndentLevelPlugin />
            <LinkPlugin />
            <TablePlugin />
            <ImagesPlugin />
            <CheckListPlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin />
            <ShortcutsPlugin />
            <MarkdownShortcutPlugin transformers={PLAYGROUND_TRANSFORMERS} />
            <OnChange returnType='markdown' onChange={props.onChangeMD} />
            <OnChange returnType='html' onChange={props.onChangeHTML} />
        </LexicalComposer>
    )
}

function OnChange({ onChange, returnType }: { onChange?: (value: string) => void; returnType: 'html' | 'markdown' }) {
    const [editor] = useLexicalComposerContext()
    return (
        <OnChangePlugin
            onChange={(editorState) => {
                editorState.read(() => {
                    onChange?.(
                        returnType === 'markdown'
                            ? $convertToMarkdownString(PLAYGROUND_TRANSFORMERS)
                            : $generateHtmlFromNodes(editor),
                    )
                })
            }}
        />
    )
}

export { RichTextField }
