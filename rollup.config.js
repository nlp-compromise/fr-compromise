import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import sizeCheck from 'rollup-plugin-filesize-check'

import { version } from './package.json'
console.log('\n 📦  - running rollup..\n')

const banner = '/* fr-compromise ' + version + ' MIT */'

export default [
  {
    input: 'src/index.js',
    output: [{ banner: banner, file: 'builds/fr-compromise.mjs', format: 'esm' }],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        babelrc: false,
        presets: ['@babel/preset-env'],
      }),
      sizeCheck({ expect: 330, warn: 10 }),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      {
        banner: banner,
        file: 'builds/fr-compromise.js',
        format: 'umd',
        sourcemap: true,
        name: 'nlp',
      },
    ],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        babelrc: false,
        presets: ['@babel/preset-env'],
      }),
      sizeCheck({ expect: 351, warn: 10 }),
    ],
  },
  {
    input: 'src/index.js',
    output: [{ file: 'builds/fr-compromise.min.js', format: 'umd', name: 'nlp' }],
    plugins: [
      resolve(),
      json(),
      commonjs(),
      babel({
        babelrc: false,
        presets: ['@babel/preset-env'],
      }),
      terser(),
      sizeCheck({ expect: 173, warn: 10 }),
    ],
  },
]
