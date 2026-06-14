type TyreCompoundProps = {
  active?: boolean;
  className?: string;
};

export function TyreCompound({ active = false, className }: TyreCompoundProps) {
  return (
    <span
      className={[
        "inline-block h-2.5 w-2.5 rounded-full",
        active ? "bg-purple" : "bg-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    />
  );
}
