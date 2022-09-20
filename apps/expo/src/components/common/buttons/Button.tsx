import { FC } from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

interface Props {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const Button: FC<Props> = ({ label, onPress }) => {
  return (
    <TouchableOpacity className="rounded-xl bg-purple-500 p-4 active:scale-95" onPress={onPress}>
      <Text className="font-semibold uppercase text-white">{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;
