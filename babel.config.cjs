/*
Using babel for jest 
  https://stackoverflow.com/questions/70883026/jest-and-babel-transpilation-syntaxerror-cannot-use-import-statement-outside
*/
module.exports = {
    presets: [
        "@babel/preset-typescript",
        [
            "@babel/preset-env",
            {
                targets: { esmodules: false, node: "current" },
            },
        ],
        "@babel/preset-flow",
    ],
    plugins: [
        ["@babel/plugin-transform-modules-commonjs"],
        ["@babel/plugin-proposal-decorators", { legacy: true }],
        ["@babel/plugin-transform-class-properties"],
        ["@babel/plugin-syntax-import-assertions"],
    ],
};
