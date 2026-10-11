import { MoonIcon, SunIcon } from 'lucide-react'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import { buttonVariants } from '~/components/ui/button'
import { setTheme, type Theme, themes, useTheme } from '~/lib/theme'

const options = {
  light: { label: 'Light', Icon: SunIcon },
  dark: { label: 'Dark', Icon: MoonIcon },
} as const

export function ThemeToggle() {
  const theme = useTheme()

  return (
    // With one choice at a time (selectionMode="single"), React Aria makes this a radio group:
    // screen readers say "Dark, radio button, 2 of 2, checked", the arrow keys move between the
    // options, and Tab enters and leaves the group with one stop. disallowEmptySelection stops
    // a click on the current option from leaving none chosen.
    <ToggleButtonGroup
      aria-label="Theme"
      selectionMode="single"
      disallowEmptySelection
      // Empty while the theme isn't known yet (in the server's HTML, see useTheme).
      selectedKeys={theme ? [theme] : []}
      onSelectionChange={(keys) => {
        // A Set with the one chosen key. Only our own ids can be in it.
        const [key] = keys
        setTheme(key as Theme)
      }}
      className="flex gap-1"
    >
      {themes.map((id) => {
        const { label, Icon } = options[id]
        return (
          // The icon has no text, so aria-label is the button's name. lucide marks the icon
          // aria-hidden, so it isn't read out as well.
          // The chosen option is filled with the brand colour: at least 3:1 against the page,
          // so it shows which is chosen by more than a faint tint (WCAG 1.4.11).
          <ToggleButton
            key={id}
            id={id}
            aria-label={label}
            className={buttonVariants({
              variant: 'ghost',
              size: 'icon',
              className:
                'data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary/80',
            })}
          >
            <Icon />
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}
