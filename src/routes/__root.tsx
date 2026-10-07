import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

// The root route wraps every page. Its `head` sets the <title> and <meta> tags,
// and its component is the HTML shell that the page is placed in.
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mise" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      {/* Outlet: the child route (for example index.tsx) is rendered here. */}
      <Outlet />
    </RootDocument>
  );
}

// The <html>, <head> and <body> tags. HeadContent fills <head> from the `head`
// above, and Scripts adds the JavaScript that makes the page interactive.
function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
