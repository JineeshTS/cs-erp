import type { MetadataRoute } from "next";

/**
 * ERP-095: PWA Manifest for "Add to Home Screen" capability.
 * Next.js auto-serves this at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CS-ERP",
    short_name: "CS-ERP",
    description: "AI-powered Container Shipping ERP for Qatar, UAE, KSA, and India",
    start_url: "/dashboard",
    display: "standalone",
    theme_color: "#2563eb",
    background_color: "#ffffff",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
