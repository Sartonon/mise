// eslint-plugin-react-hooks: every function here breaks one rule.
import { useEffect, useState } from 'react'

// react-hooks/rules-of-hooks: a hook inside an `if`. React matches hooks to their state
// by call order, so a hook that only runs sometimes gets another hook's state.
export function ConditionalHook({ show }: { show: boolean }) {
  if (show) {
    const [count] = useState(0)
    return <p>{count}</p>
  }
  return null
}

// react-hooks/set-state-in-effect: setting state straight away in an effect renders twice.
// The value can be computed during render instead.
export function FullName({ first, last }: { first: string; last: string }) {
  const [fullName, setFullName] = useState('')
  useEffect(() => {
    setFullName(`${first} ${last}`)
  }, [first, last])
  return <p>{fullName}</p>
}

// react-hooks/exhaustive-deps (a warning): the effect uses `recipeId`, but it's missing
// from the dependency list, so the effect won't rerun when `recipeId` changes.
export function RecipeTitle({ recipeId }: { recipeId: string }) {
  useEffect(() => {
    document.title = `Recipe ${recipeId}`
  }, [])
  return null
}
