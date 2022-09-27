import { BarCodeScanner } from "expo-barcode-scanner";
import { FC, useEffect } from "react";
import { BackHandler, StyleSheet } from "react-native";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const GameCodeScanner: FC<Props> = ({ isOpen, onClose, onScan }) => {
  useEffect(() => {
    const closeScanner = () => {
      if (isOpen) {
        onClose();
        return true;
      } else {
        return false;
      }
    };
    BackHandler.addEventListener("hardwareBackPress", closeScanner);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", closeScanner);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  return (
    <BarCodeScanner
      className="z-10 bg-white"
      style={StyleSheet.absoluteFillObject}
      onBarCodeScanned={({ data }) => {
        onClose();
        onScan(data);
      }}
    />
  );
};

export default GameCodeScanner;
