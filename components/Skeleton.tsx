import { cn } from "@/Lib/utils";

interface Props { className?: string; children?: React.ReactNode }

export const Skeleton = ({ className }: Props) => (
  <div className={cn("skeleton rounded-sm", className)} />
);
