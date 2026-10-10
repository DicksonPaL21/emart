import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return ["index", "login", "dashboard", "history", "setting", "about", "error"].map((page) => ({
      source: `/${page}.html`,
      destination: page === "index" ? "/" : `/${page}`,
      permanent: true,
    }));
  },
};
export default config;
