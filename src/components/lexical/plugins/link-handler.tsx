import React from 'react'
import { IconCheck, IconLink, IconUnlink } from 'cleon-icons'
import { Button, Form, Popover, TextField, toggleStyles, Toolbar } from '@/components/ui'
import { $toggleLink, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { AutoLinkPlugin, createLinkMatcherWithRegExp } from '@lexical/react/LexicalAutoLinkPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'

function validateUrl(url: string): boolean {
    const urlRegExp = new RegExp(
        /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
    )
    return url === 'https://' || urlRegExp.test(url)
}

const urlRegExp =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/

const emailRegExp =
    /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

const matchers = [
    createLinkMatcherWithRegExp(urlRegExp, (text) => {
        return text
    }),
    createLinkMatcherWithRegExp(emailRegExp, (text) => {
        return `mailto:${text}`
    }),
]

export function LinkPlugin() {
    return (
        <>
            <LexicalLinkPlugin validateUrl={validateUrl} />
            <AutoLinkPlugin matchers={matchers} />
            <ClickableLinkPlugin />
        </>
    )
}

export function ToggleLink({ isLink }: { isLink: string }) {
    const [url, setUrl] = React.useState<string>('')
    const [editor] = useLexicalComposerContext()

    function unLink() {
        editor.update(() => {
            $toggleLink(null)
        })
    }

    function insertLink() {
        if (!validateUrl(url)) return
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
        setUrl('')
    }

    if (isLink !== '')
        return (
            <Toolbar.Item
                isSelected={false}
                size='icon'
                isDisabled={!editor.isEditable() || isLink === 'auto'}
                onChange={unLink}
            >
                <IconUnlink />
            </Toolbar.Item>
        )
    else
        return (
            <Popover>
                <Popover.Trigger isDisabled={!editor.isEditable()} className={toggleStyles({ size: 'icon' })}>
                    <IconLink />
                </Popover.Trigger>
                <Popover.Content aria-label='Link' className='sm:p-2'>
                    <Popover.Header>
                        <Popover.Description>Enter the link URL below</Popover.Description>
                    </Popover.Header>
                    <Popover.Body>
                        <Form onSubmit={insertLink}>
                            <TextField
                                autoFocus
                                name='url'
                                placeholder='https://'
                                suffix={
                                    <Button type='submit'>
                                        <IconCheck />
                                    </Button>
                                }
                                prefix={<IconLink />}
                                aria-label='URL'
                                value={url}
                                onChange={setUrl}
                            />
                        </Form>
                    </Popover.Body>
                </Popover.Content>
            </Popover>
        )
}
