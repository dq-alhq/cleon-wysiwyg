import { BrandGithub } from 'cleon-icons'
import { CLI } from '@/components/cli'
import { buttonVariants } from '@/components/ui/button'

export function Hero() {
    return (
        <div className='relative overflow-hidden isolate bg-background'>
            <div
                aria-hidden='true'
                className='absolute inset-x-0 hidden overflow-hidden -top-10 -z-10 transform-gpu blur-3xl sm:-top-56 sm:block'
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-info to-primary opacity-10 dark:opacity-[0.17] sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]'
                />
            </div>
            <svg
                aria-hidden='true'
                className='absolute inset-0 -z-10 hidden h-full w-full stroke-muted [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)] sm:block'
            >
                <defs>
                    <pattern
                        x='50%'
                        y={-1}
                        id='0787a7c5-978c-4f66-83c7-11c213f99cb7'
                        width={200}
                        height={200}
                        patternUnits='userSpaceOnUse'
                    >
                        <path d='M.5 200V.5H200' fill='none' />
                    </pattern>
                </defs>
                <rect fill='url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)' width='100%' height='100%' strokeWidth={0} />
            </svg>
            <div className='pt-10 pb-6 border-b lg:py-16'>
                <div className='container'>
                    <h1 className='max-w-xl mb-2 text-2xl font-bold lg:mb-6 lg:text-5xl'>CLEON WYSIWYG</h1>
                    <div className='block max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-xl'>
                        This is Rich Text Field (WYSIWYG) from{' '}
                        <a
                            target='_blank'
                            className='font-semibold text-foreground hover:text-primary'
                            href='https://cleon-ui.vercel.app'
                        >
                            CLEON UI
                        </a>{' '}
                        with extended features.
                        <br />
                        This WYSIWYG Editor is based on{' '}
                        <a
                            target='_blank'
                            className='font-semibold text-foreground hover:text-primary'
                            href='https://lexical.dev/docs/getting-started/react'
                        >
                            LEXICAL
                        </a>
                    </div>
                    <div className='flex flex-col gap-4 mt-6 lg:flex-row lg:items-end'>
                        <CLI command='init' className='min-w-60' />
                        <a
                            className={buttonVariants({ variant: 'outline' })}
                            target='_blank'
                            href='https://github.com/dq-alhq/cleon-wysiwyg'
                        >
                            <BrandGithub className='size-5' />
                            Source
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
