export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      ecmaFeatures: {
        jsx: true
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly"
      }
    },
    plugins: [
      "react-refresh"
    ],
    rules: {
      "react-refresh/only-export-components": "warn",
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off"
    }
  }
]