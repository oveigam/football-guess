module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ["nativewind/babel", "transform-inline-environment-variables"],
    presets: ["babel-preset-expo"],
  };
};
