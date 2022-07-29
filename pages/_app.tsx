import "../styles/globals.css"
import "regenerator-runtime/runtime"
import type { AppProps } from "next/app"

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
