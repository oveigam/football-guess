import { FC } from "react";
import { Image, Text, View } from "react-native";

// @ts-ignore wtf
import heart from "./../../../assets/heart.png";

interface Props {
  health: number;
}

const HealthIndicator: FC<Props> = ({ health }) => {
  return (
    <View className="flex flex-row items-center gap-x-1 p-2">
      <Text className="text-lg font-bold leading-none">{health}</Text>
      <Image className="h-[24px] w-[24px]" source={heart} />
    </View>
  );
};

export default HealthIndicator;
