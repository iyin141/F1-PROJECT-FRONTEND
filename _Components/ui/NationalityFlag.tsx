import Image from "next/image";
import { getDriverFlagUrl } from "@/Lib/nationality";

type NationalityFlagProps = {
  driverCode: string;
  className?: string;
  size?: 20 | 40 | 80 | 160;
  alt?: string;
};

export function NationalityFlag({
  driverCode,
  className,
  size = 40,
  alt,
}: NationalityFlagProps) {
  const src = getDriverFlagUrl(driverCode.toUpperCase(), size);

  if (!src) {
    return <div className={["rounded-sm border border-border-subtle bg-surface2", className].filter(Boolean).join(" ")} aria-hidden />;
  }

  return (
    <Image
      src={src}
      alt={alt ?? `${driverCode.toUpperCase()} flag`}
      width={size}
      height={size}
      loading="lazy"
      className={["rounded-sm border border-border-subtle object-cover", className].filter(Boolean).join(" ")}
    />
  );
}
