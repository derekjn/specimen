import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

const plugins = [
  nodeResolve(),
  commonjs({
    include: 'node_modules/**',
  }),
];

const watch = {
  clearScreen: false,
};

export default [{
  input: "./examples/basic-topology/src/index.js",
  output: {
    file: "./examples/basic-topology/bundle.js",
    format: "iife"
  },
  plugins,
  watch,
}];
