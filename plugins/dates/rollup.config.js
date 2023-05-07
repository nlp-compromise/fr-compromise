import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve';

const opts = { keep_classnames: true, module: true }

export default [
  {
    input: 'src/plugin.js',
    output: [{ file: 'builds/fr-compromise-dates.cjs', format: 'umd', name: 'frCompromiseDates' }],
    plugins: [nodeResolve()],
  },
  {
    input: 'src/plugin.js',
    output: [{ file: 'builds/fr-compromise-dates.min.js', format: 'umd', name: 'frCompromiseDates' }],
    plugins: [nodeResolve(), terser(opts)],
  },
  {
    input: 'src/plugin.js',
    output: [{ file: 'builds/fr-compromise-dates.mjs', format: 'esm' }],
    plugins: [nodeResolve(), terser(opts)],
  }
]
