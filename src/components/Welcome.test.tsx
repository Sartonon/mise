import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Welcome } from "./Welcome";

describe("Welcome", () => {
  it("greets the user with a heading", () => {
    render(<Welcome />);

    // Find it the way a user (or a screen reader) would: a heading that says "Hello, Mise".
    expect(screen.getByRole("heading", { name: "Hello, Mise" })).toBeInTheDocument();
  });
});
