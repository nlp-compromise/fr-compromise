import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import sizeCheck from 'rollup-plugin-filesize-check'
const opts = {
  keep_classnames: true,
  module: true
}

export default [
  // === Main ==
  {
    input: 'src/index.js',
    output: [{ file: 'builds/fr-compromise.cjs', format: 'umd', name: 'frCompromise' }],
    plugins: [nodeResolve()]
  },
  {
    input: 'src/index.js',
    output: [{ file: 'builds/fr-compromise.min.js', format: 'umd', name: 'frCompromise' }],
    plugins: [
      nodeResolve(),
      terser(opts),
      sizeCheck({
        expect: 229,
        warn: 10, // acceptable (+/-)
        throw: 50 // unacceptable (+/-)
      })
    ]
  },
  {
    input: 'src/index.js',
    output: [{ file: 'builds/fr-compromise.mjs', format: 'esm' }],
    plugins: [nodeResolve(), terser(opts)]
  }
]
