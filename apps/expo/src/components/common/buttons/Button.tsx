import { FC } from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

interface Props {
  label: string;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

const Button: FC<Props> = ({ label, disabled = false, onPress }) => {
  return (
    <TouchableOpacity className="bg-primary-500 rounded-xl p-4 active:scale-95" disabled={disabled} onPress={onPress}>
      <Text className="text-center font-semibold uppercase text-white">{label}</Text>
    </TouchableOpacity>
  );
};

export default Button;
