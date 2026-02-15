import type { Config } from "tailwindcss";

const config: Config = {
  // 핵심: 파일 경로가 src 폴더를 정확히 가리키고 있는지 확인!
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        najeon: {
          bg: "#0A0A0A",
          point: "#5EEAD4",
          aura: "#C084FC",
        },
      },
    },
  },
  plugins: [],
};
export default config;