import type { MetadataRoute } from "next";

const SITE_URL = "https://www.fxcryptoedge.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account/auth pages and the admin panel have no SEO value and
      // shouldn't be crawled or show up in search results.
      disallow: [
        "/dashboard",
        "/admin",
        "/admin/*",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
