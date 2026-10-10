import { createFileRoute } from "@tanstack/react-router";
import { Welcome } from "~/components/Welcome";

// The file's path decides the URL: `routes/index.tsx` is "/".
// The "/" string must match the path. The Start plugin writes it for you, and the types check it.
export const Route = createFileRoute("/")({
  component: Welcome,
});
