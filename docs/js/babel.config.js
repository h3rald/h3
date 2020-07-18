module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "10",
        },
        debug: false,
      },
    ],
  ],
  ignore: ["node_modules"],
  plugins: ["@babel/plugin-transform-modules-commonjs"],
};
