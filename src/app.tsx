import React from 'react'
import { Hero } from './components/hero'
import { RichTextField } from './components/lexical'
import { Card } from './components/ui'

export default function App() {
    const [htmlText, setHtmlText] = React.useState<string>('')
    const [mdText, setMdText] = React.useState<string>('')

    return (
        <>
            <Hero />
            <div className='container my-6'>
                <div className='flex flex-col w-full gap-6'>
                    <RichTextField
                        valueHTML={htmlText}
                        onChangeHTML={setHtmlText}
                        valueMD={mdText}
                        onChangeMD={setMdText}
                    />
                    <div className='grid grid-cols-2 gap-6'>
                        <Card>
                            <Card.Header>
                                <Card.Title>HTML Output</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <pre className='text-xs'>
                                    <code className='language-html text-wrap'>{htmlText}</code>
                                </pre>
                            </Card.Content>
                        </Card>
                        <Card>
                            <Card.Header>
                                <Card.Title>Markdown Output</Card.Title>
                            </Card.Header>
                            <Card.Content>
                                <pre className='text-xs'>
                                    <code className='language-md text-wrap flex-wrap break-all'>{mdText}</code>
                                </pre>
                            </Card.Content>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}
