import { createServerFn } from '@tanstack/react-start'
import { getServerInfo } from './server-info.server'

// A server function: the handler only ever runs on the server.
// On the server, calling it is a plain function call. In the browser, the build
// swaps the handler for a stub that sends an HTTP request to the server and
// returns the result, so this file is safe to import anywhere.
export const fetchServerInfo = createServerFn({ method: 'GET' }).handler(() => getServerInfo())
