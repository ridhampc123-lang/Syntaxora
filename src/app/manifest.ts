import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Syntaxora — AI Learning Academy",
    short_name: "Syntaxora",
    description:
      "Applied artificial intelligence, computer vision, and machine learning education for kids, teens, and adults.",
    start_url: "/",
    display: "standalone",
    background_color: "#17243A",
    theme_color: "#17243A",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
  };
}
