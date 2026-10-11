import { useState } from 'react'
import { Button } from '~/components/ui/button'

// An example of the shadcn Button. `as const` makes this a fixed list, so `tips[0]` has a
// known type (a string, never undefined).
export const tips = [
  'Salt pasta water until it tastes like the sea.',
  'Let meat rest after cooking, so the juices stay in.',
  'Toast spices in a dry pan to wake up their flavour.',
] as const

export function CookingTip() {
  // Which tip is showing: -1 before the first press.
  const [index, setIndex] = useState(-1)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* onPress is React Aria's click: it fires the same way for a mouse, a finger,
          Enter or Space, and a screen reader. */}
      <Button
        variant="secondary"
        onPress={() => {
          setIndex((index + 1) % tips.length)
        }}
      >
        Show a cooking tip
      </Button>
      {/* role="status" is a live region: when its text changes, screen readers read the new
          text out, without moving focus away from the button. It must be on the page before
          the text changes, so it's there (empty) from the start. */}
      <p role="status" className="text-muted-foreground">
        {index >= 0 && tips[index]}
      </p>
    </div>
  )
}
