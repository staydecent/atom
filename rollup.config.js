import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import cleanup from 'rollup-plugin-cleanup'
import uglify from 'rollup-plugin-uglify'
import filesize from 'rollup-plugin-filesize'

export default {
  name: 'atom',
  input: 'index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**',  // Default: undefined

      // if false then skip sourceMap generation for CommonJS modules
      sourceMap: false  // Default: true
    }),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    cleanup({
      comments: 'none'
    }),
    uglify(),
    filesize()
  ]
}
