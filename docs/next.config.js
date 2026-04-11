module.exports = async () => {
  const { default: nextra } = await import("nextra");
  const withNextra = nextra({
    theme: "nextra-theme-docs",
    themeConfig: "./theme.config.jsx",
  });

  return withNextra({
    experimental: {
      esmExternals: "loose",
    },
  });
};

// If you have other Next.js configurations, you can pass them as the parameter:
// module.exports = withNextra({ /* other next.js config */ })
