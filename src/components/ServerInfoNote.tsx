import type { ServerInfo } from '~/server/server-info.server'

// Only the type is imported from the .server.ts file (`import type` is erased at build time),
// so no server code comes along.
export function ServerInfoNote({ info }: { info: ServerInfo }) {
  return (
    <p>
      {/* <time dateTime> gives the exact time to machines; the text is for people.
          The text comes from the server as is: formatting it with the browser's locale
          or time zone could differ from the server's, and React would warn about a
          hydration mismatch. */}
      Rendered by the server at <time dateTime={info.time}>{info.time}</time>, on Node.js{' '}
      {info.nodeVersion} (region: {info.region}).
    </p>
  )
}
