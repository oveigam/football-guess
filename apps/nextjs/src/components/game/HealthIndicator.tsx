import Image from "next/future/image";
import { FC } from "react";

import heart from "../../assets/heart.png";

interface Props {
  health: number;
}

const HealthIndicator: FC<Props> = ({ health }) => {
  return (
    <div className="flex items-center gap-1 p-2">
      <span className="text-lg font-bold leading-none">{health}</span>
      <Image className="h-[24px] w-[24px]" height={24} width={24} src={heart} />
    </div>
  );
};

export default HealthIndicator;
