import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_KEY_1: process.env.OPENAI_API_KEY_1,
    OPENAI_API_KEY_2: process.env.OPENAI_API_KEY_2,
    OPENAI_API_KEY_3: process.env.OPENAI_API_KEY_3,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  // ...other config options if needed
};

export default nextConfig;
