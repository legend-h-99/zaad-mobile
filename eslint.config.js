const { defineConfig, globalIgnores } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  globalIgnores(['dist/**', 'dist-test/**', 'coverage/**', '.expo/**', 'outputs/**', 'output/**']),
  expoConfig,
])
