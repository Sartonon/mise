// `.server.ts`: server-only code. Only server function handlers import it,
// so `process` and the env vars below never end up in the browser's JavaScript.

export type ServerInfo = {
  time: string
  nodeVersion: string
  region: string
}

// A plain function: a test can call it directly, without a server or a browser.
export function getServerInfo(now = new Date()): ServerInfo {
  return {
    time: now.toISOString(),
    // The version of Node.js running this code. Only the server has `process`.
    nodeVersion: process.version,
    // Vercel sets VERCEL_REGION to the data center that ran the function (for example "fra1").
    region: process.env.VERCEL_REGION ?? 'local',
  }
}
