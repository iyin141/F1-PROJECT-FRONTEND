import Image from "next/image";

interface FlagImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function FlagImage({
  src,
  alt = "",
  className = "",
  width = 18,
  height = 12,
}: FlagImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      className={`rounded-sm object-cover ${className}`}
      style={{ width: 'auto', height: 'auto' }}
    />
  );
}
