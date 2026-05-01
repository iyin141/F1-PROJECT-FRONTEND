'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-mono font-bold text-red">404</h1>
        <p className="mb-4 text-xl font-mono text-text-dim">COMPONENT NOT FOUND</p>
        <Link href="/" className="label-mono text-red underline hover:text-white transition-colors">
          Return to Base
        </Link>
      </div>
    </div>
  );
}
