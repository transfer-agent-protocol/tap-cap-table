import Image from 'next/image';
import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'

const themeConfig = {
	logo: (
		<>
			<Image src="/tap-logo.svg" alt="Transfer Agent Protocol" width={48} height={48} />
			<span style={{ marginLeft: '0.4rem', fontWeight: 800 }}>
				Transfer Agent Protocol
			</span>
		</>
	),
	project: {
		link: 'https://github.com/transfer-agent-protocol/tap-cap-table'
	},
	docsRepositoryBase: 'https://github.com/transfer-agent-protocol/tap-cap-table/tree/main/docs',
	footer: {
		text: (
			<span>
				Copyright {new Date().getFullYear()} © {' '}
					thatalexpalmer.eth
			</span>
		)
	},
	// TODO: Fix this https://github.com/shuding/nextra/issues/2546#issuecomment-1845615928
	head: () => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { asPath, defaultLocale, locale } = useRouter()
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { frontMatter } = useConfig()
		
    const url =
      'https://docs.transferagentprotocol.xyz' +
      (defaultLocale === locale ? asPath : `/${locale}${asPath}`)
 
    return (
		<>
		<meta charSet="utf-8" />
		<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,user-scalable=yes" />
		<meta name="author" content="Transfer Agent Protocol - Documentation" />
        <meta property="og:url" content={url} />
		<meta property="og:type" content="website" />
		<meta property="og:site_name" content="Transfer Agent Protocol - Documentation" />
        <meta property="og:title" content={frontMatter.title || 'Transfer Agent Protocol - Documentation'} />
        <meta
          property="og:description"
          content={frontMatter.description || 'Transfer Agent Protocol documentation for developers. Mint onchain cap tables, issue shares, deploy the protocol on your chain or network.'}
		/>
			
		<link rel="canonical" href="https://docs.transferagentprotocol.xyz" />
		<link rel="manifest" href="/manifest.json" />

		<link rel="icon" href="/favicon.ico" />

		<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />

		<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0c0b0c" />
		<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
		<meta name="theme-color" content="#fafafc" />
		<meta name="msapplication-TileColor" content="#0c0b0c" />
		<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
			
      </>
    )
  }
}

export default themeConfig;
