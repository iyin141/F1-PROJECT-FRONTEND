import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useHoverDelay } from "@/hooks/useHoverDelay";
import prefetchDriver from "@/Lib/prefetch";
import type { Driver } from "@/types/ui";

interface DriverLinkProps {
  driver: Driver;
  year: number;
  className?: string;
}

export function DriverLink({ driver, year, className = "font-semibold transition-colors hover:text-blue" }: DriverLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { onMouseEnter, onMouseLeave } = useHoverDelay(() => {
    prefetchDriver(driver.code, year, queryClient, router);
  }, 150);

  return (
    <Link
      href={`/drivers/${driver.code}/${year}`}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      prefetch={false}
    >
      {driver.code}
    </Link>
  );
}
