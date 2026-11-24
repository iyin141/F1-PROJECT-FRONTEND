import { Barlow_Condensed } from "next/font/google";
import { V2Providers } from "@/components/v2/V2Providers";
import "@/styles/v2.css";

const display = Barlow_Condensed({ variable: "--font-f1-display", subsets: ["latin"], weight: ["500", "600", "700"] });

/** Shell for every v2 page: Astryx theme (light/dark follows next-themes) plus the `.v2` token scope. */
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v2 ${display.variable}`}>
      <V2Providers>{children}</V2Providers>
    </div>
  );
}
