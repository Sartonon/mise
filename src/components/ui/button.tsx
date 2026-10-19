// shadcn/ui's Button in the aria-nova style (React Aria Components underneath), copied into our
// code so we can change it. shadcn's source uses placeholder classes (cn-button-variant-default...)
// that its CLI replaces with the chosen style's classes; these are nova's, filled in by hand.
// Changes from the original:
// - Focus uses our app-wide :focus-visible outline (app.css), not a half-transparent ring,
//   which could fall below the 3:1 contrast a focus indicator needs (WCAG 1.4.11).
// - Hover colours use our roles: there's no `muted` or `input` colour in our palettes.
// - No `destructive` variant yet: our palettes have no colour for it. It comes with the
//   first delete button.
// - No `dark:` classes: our colours switch between light and dark by themselves.
// - No transition class (nova has `transition-all`): app.css fades every element's background
//   and border together, so the button fades in step with the page when the theme changes.
// - Pill-shaped (rounded-full), as docs/DESIGN.md asks, instead of nova's rounded-lg.
// - No LinkButton yet. For a link that looks like a button, we'll put the classes on
//   TanStack's <Link>, whose `to` is type-checked.
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import type { RefAttributes } from 'react'
import {
  Button as ButtonPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
} from 'react-aria-components'

// cva() turns variant names into class lists: the first string is used every time, and
// `variants` adds the classes for the chosen `variant` and `size`. Exported so other React Aria
// buttons (like the theme toggle's ToggleButtons) can look the same.
export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50 active:not-aria-[haspopup]:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-secondary hover:text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        // On hover, the fill mixes in 5% of the text colour: a bit darker in light mode,
        // a bit lighter in dark mode.
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-secondary hover:text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      // Bigger than nova's (32px by default, with 14px text): the default is 44px high with the
      // page's 16px text, the size WCAG's stricter target rule (2.5.5, AAA) and Apple's guidelines
      // ask for, so it's easy to hit with a finger. The smallest is 28px, above WCAG 2.2 AA's 24px
      // minimum (2.5.8). These classes come after the shared ones above, and cn() keeps the last
      // of two conflicting classes, so text-base here replaces text-sm there.
      // An icon with data-icon="inline-start" or "inline-end" gets less padding on its side.
      size: {
        default:
          "h-11 gap-2 px-4 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-5",
        xs: "h-7 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: 'h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        lg: "h-12 gap-2 px-6 text-lg has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 [&_svg:not([class*='size-'])]:size-5",
        'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': 'size-9',
        'icon-lg': "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

// Takes React Aria's Button props, plus `variant` and `size`. React Aria uses its own names
// for some of them: `onPress` (instead of onClick, and the same for mouse, touch, keyboard and
// screen readers) and `isDisabled`. React Aria lets `className` be a function of the button's
// state; here it's a plain string, so cn() can merge it.
export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: Omit<ButtonPrimitiveProps, 'className'> &
  RefAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { className?: string }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // A `className` from the caller comes last, so cn() lets it win over a conflicting class.
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
