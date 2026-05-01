import { getDriverFlagUrl } from "@/Lib/nationality";

type DriverFlagProps = {
  driverCode: string;
  className?: string;
};

export const DriverFlag = ({ driverCode, className }: DriverFlagProps) => {
  const flag = getDriverFlagUrl(driverCode, 40);
  if (!flag) return <span className={className} style={{ display: "inline-block", width: 18, height: 12 }} />;

  return (
    <img
      src={flag}
      alt=""
      width={18}
      height={12}
      loading="lazy"
      className={className}
      style={{ borderRadius: "2px", objectFit: "cover" }}
    />
  );
};
