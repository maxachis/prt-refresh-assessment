import { defineConfig } from 'vitest/config';

// `pgh-ghost-bus/` is a gitignored reference checkout of a separate project
// (see .gitignore). Without this it is inside the default scan root, and
// `vitest run` silently reports its ~200 tests as if they were ours.
export default defineConfig({
  test: {
    include: ['frontend/**/*.test.ts'],
    exclude: ['pgh-ghost-bus/**', 'node_modules/**'],
  },
});
