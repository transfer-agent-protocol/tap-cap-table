module.exports = async () => {
  const { default: nextra } = await import("nextra");
  const withNextra = nextra({
    theme: "nextra-theme-docs",
    themeConfig: "./theme.config.jsx",
  });

  return withNextra({});
};
