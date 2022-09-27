import { FC } from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

interface Props {
  label: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const Button: FC<Props> = ({ label, onPress }) => {
  return (
    <TouchableOpacity className="bg-primary-500 rounded-xl p-4 active:scale-95" onPress={onPress}>
      <Text className="font-semibold uppercase text-white text-center">{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;
