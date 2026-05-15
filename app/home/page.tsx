import React, { Suspense } from "react";
import { HomePageShell } from "@/features/home/HomePage";

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const MIN_YEAR = 1950;

  if (currentYear < MIN_YEAR) {
    throw new Error(`Current year ${currentYear} is before ${MIN_YEAR}`);
  }

  return (
    
      <HomePageShell initialYear={currentYear} />
   
  );
}
