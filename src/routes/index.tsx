import { createFileRoute } from '@tanstack/react-router'
import { ServerInfoNote } from '~/components/ServerInfoNote'
import { Welcome } from '~/components/Welcome'
import { fetchServerInfo } from '~/server/server-info.functions'

// The file's path decides the URL: `routes/index.tsx` is "/".
// The "/" string must match the path. The Start plugin writes it for you, and the types check it.
export const Route = createFileRoute('/')({
  // The loader fetches the page's data before the page renders.
  // On the first visit it runs on the server, and its result is sent inside the HTML,
  // so the browser doesn't fetch it again. After a client-side navigation (clicking a
  // <Link>) it runs in the browser, and fetchServerInfo becomes an HTTP request.
  loader: () => fetchServerInfo(),
  component: Home,
})

function Home() {
  // Typed from the loader's return value: no type annotations needed.
  const info = Route.useLoaderData()

  return (
    <Welcome>
      <ServerInfoNote info={info} />
    </Welcome>
  )
}
