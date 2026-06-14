import Image from "next/image";
import { getDriverFlagUrl, getFlagUrlByNationality } from "@/Lib/nationality";

type NationalityFlagProps = {
  driverCode?: string;
  nationality?: string;
  className?: string;
  size?: 20 | 40 | 80 | 160;
  alt?: string;
};

export function NationalityFlag({
  driverCode,
  nationality,
  className,
  size = 40,
  alt,
}: NationalityFlagProps) {
  let src = null;

  if (driverCode) {
    src = getDriverFlagUrl(driverCode.toUpperCase(), size);
  }

  if (!src && nationality) {
    src = getFlagUrlByNationality(nationality, size);
  }

  if (!src) {
    return <div className={["rounded-sm border border-border-subtle bg-surface2", className].filter(Boolean).join(" ")} aria-hidden />;
  }

  return (
    <Image
      src={src}
      alt={alt ?? `${driverCode?.toUpperCase() ?? nationality ?? "Unknown"} flag`}
      width={size}
      height={size}
      loading="lazy"
      className={["rounded-sm border border-border-subtle object-cover", className].filter(Boolean).join(" ")}
      style={{ width: 'auto', height: 'auto' }}
    />
  );
}
