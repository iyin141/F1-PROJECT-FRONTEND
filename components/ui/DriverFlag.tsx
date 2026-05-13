import { getDriverFlagUrl } from "@/Lib/nationality";
import { FlagImage } from "@/_Components/ui/FlagImage";

type DriverFlagProps = {
  driverCode: string;
  className?: string;
};

export const DriverFlag = ({ driverCode, className }: DriverFlagProps) => {
  const flag = getDriverFlagUrl(driverCode, 40);
  if (!flag) return <span className={className} style={{ display: "inline-block", width: 18, height: 12 }} />;

  return <FlagImage src={flag} className={className} />;
};
