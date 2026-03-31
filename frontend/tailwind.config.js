/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#0f766e",
          600: "#0b5f5c",
          700: "#0b4950"
        },
        accent: "#f97316",
        surface: "#08111f",
        panel: "#0f172a"
      },
      boxShadow: {
        glow: "0 20px 45px rgba(15, 118, 110, 0.18)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at top left, rgba(14, 165, 233, 0.32), transparent 30%), radial-gradient(circle at top right, rgba(249, 115, 22, 0.24), transparent 28%), linear-gradient(135deg, rgba(8,17,31,1) 0%, rgba(15,23,42,1) 48%, rgba(8,17,31,1) 100%)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulsebar: "pulsebar 1.6s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulsebar: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" }
        }
      }
    }
  },
  plugins: []
};
