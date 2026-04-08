module.exports = {
  root: true,
  extends: ["universe/native", "universe/web"],
  ignorePatterns: ["build"],
  rules: {
    "react-hooks/exhaustive-deps": "warn",
  },
};
