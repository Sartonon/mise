// eslint-plugin-testing-library: this test passes, but it tests the wrong way.
import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Welcome } from '~/components/Welcome'

it('finds the heading the wrong way', () => {
  const { container, getByText, debug } = render(<Welcome />)

  // testing-library/no-container and no-node-access: digging in the DOM by tag name
  // instead of finding the heading by role, the way a user (or screen reader) would.
  expect(container.querySelector('h1')).toBeInTheDocument()

  // testing-library/prefer-screen-queries: use `screen.getByText`, not the query
  // returned by `render`.
  expect(getByText('Hello, Mise')).toBeInTheDocument()

  // testing-library/no-debugging-utils: a leftover `debug()` that prints the whole DOM.
  debug()
})
