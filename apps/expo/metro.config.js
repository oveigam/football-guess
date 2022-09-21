const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ["jsx", "js", "ts", "tsx", "cjs"];

module.exports = config;
