import { terser } from 'rollup-plugin-terser'
import sizeCheck from 'rollup-plugin-filesize-check'
import { nodeResolve } from '@rollup/plugin-node-resolve';

const opts = { keep_classnames: true, module: true }

export default [
  {
    input: 'src/plugin.js',
    output: [{ file: 'builds/fr-compromise-dates.cjs', format: 'umd', name: 'frCompromiseDates' }],
    plugins: [nodeResolve(), sizeCheck({ expect: 236, warn: 15 })],
  },
  {
    input: 'src/plugin.js',
    output: [{ file: 'builds/fr-compromise-dates.min.js', format: 'umd', name: 'frCompromiseDates' }],
    plugins: [nodeResolve(), terser(opts), sizeCheck({ expect: 113, warn: 15 })],
  },
  {
    input: 'src/plugin.js',
    output: [{ file: 'builds/fr-compromise-dates.mjs', format: 'esm' }],
    plugins: [nodeResolve(), terser(opts), sizeCheck({ expect: 113, warn: 15 })],
  }
]
