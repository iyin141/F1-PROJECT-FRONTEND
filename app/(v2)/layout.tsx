import localFont from "next/font/local";
import { V2Providers } from "@/components/v2/V2Providers";
import "@/styles/v2.css";

// Barlow Condensed (latin, OFL) is vendored in public/fonts so builds never depend on Google Fonts being reachable.
const display = localFont({
  variable: "--font-f1-display",
  display: "swap",
  src: [
    { path: "../../public/fonts/BarlowCondensed-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/BarlowCondensed-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/BarlowCondensed-700.woff2", weight: "700", style: "normal" },
  ],
});

/** Shell for every v2 page: Astryx theme (light/dark follows next-themes) plus the `.v2` token scope. */
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v2 ${display.variable}`}>
      <V2Providers>{children}</V2Providers>
    </div>
  );
}
