module.exports = {
    root: true,
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    rules: {
        'no-constant-condition': ['error', { checkLoops: false }]
    },
    globals: {},
    parserOptions: {
        ecmaVersion: 2018
    },
    env: {
        browser: true,
        commonjs: true,
        es6: true
    }
};
