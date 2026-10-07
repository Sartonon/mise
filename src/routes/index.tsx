import { createFileRoute } from "@tanstack/react-router";

// The file's path decides the URL: `routes/index.tsx` is "/".
// The "/" string must match the path. The Start plugin writes it for you, and the types check it.
export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main>
      <h1>Hello, Mise</h1>
      <p>Recipes and meal planning, built one small step at a time.</p>
    </main>
  );
}
