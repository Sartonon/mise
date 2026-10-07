import { describe, expect, it } from "vitest";
import { slugify } from "~/lib/slugify";

describe("slugify", () => {
  it("lowercases words and joins them with dashes", () => {
    expect(slugify("Tomato Soup")).toBe("tomato-soup");
  });

  it("removes accents", () => {
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });

  it("turns punctuation and repeated spaces into a single dash", () => {
    expect(slugify("Mac & Cheese -- Extra   Cheesy!")).toBe("mac-cheese-extra-cheesy");
  });

  it("trims dashes from the ends", () => {
    expect(slugify("  ...Pancakes!  ")).toBe("pancakes");
  });

  // DEMO: a deliberately wrong expectation, to watch CI go red. Reverted next.
  it("keeps spaces (wrong on purpose)", () => {
    expect(slugify("Tomato Soup")).toBe("tomato soup");
  });

  it("returns an empty string when nothing is left", () => {
    expect(slugify("!!!")).toBe("");
  });
});
