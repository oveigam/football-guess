import { BarCodeScanner } from "expo-barcode-scanner";
import React, { FC, useState } from "react";
import { Text, TextInput, View, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/common/buttons/Button";
import QrScanner from "../components/qr/QrScanner";
import { ScreenProps } from "../utils/navigation";
import { trpc } from "../utils/trpc";

const UPDATE_VERSION = "1.0.4";

export const HomeScreen: FC<ScreenProps<"Home">> = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");

  const { mutate: createGame } = trpc.game.createGame.useMutation({
    onSuccess({ gameId, myId }) {
      navigation.navigate("Game", { gameId, myId });
    },
  });

  const { mutate: joinLobby } = trpc.game.joinLobby.useMutation({
    onSuccess({ gameId, myId }) {
      navigation.navigate("Game", { gameId, myId });
    },
  });

  return (
    <SafeAreaView className="bg-primary-50 h-full">
      <QrScanner isOpen={scanning} onClose={() => setScanning(false)} onScan={(code) => joinLobby({ code })} />
      <View className="flex h-full w-full items-center justify-center gap-y-8">
        <View className="flex items-center justify-center">
          <Text className="text-primary-500 text-8xl font-semibold">Football</Text>
          <Text className="text-primary-700 text-8xl font-bold">Guess</Text>
        </View>
        <View className="mb-24">
          <Button
            label="New Game"
            onPress={() => {
              setCode("");
              createGame();
            }}
          />
          <View className="mt-2 flex flex-row items-center justify-center gap-x-1">
            <TextInput
              className="border-primary-100 rounded-xl border bg-white p-3"
              maxLength={4}
              placeholder="CODE"
              value={code}
              onChangeText={setCode}
            />
            <View>
              <Button
                label="Join Game"
                onPress={() => {
                  setCode("");
                  joinLobby({ code: code.toLowerCase() });
                }}
              />
            </View>
            <TouchableOpacity
              className="bg-primary-500 rounded-xl p-2 active:scale-95"
              onPress={async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                if (status === "granted") {
                  setScanning(true);
                }
              }}
            >
              <Image className="h-8 w-8" source={require("../../assets/qr.png")} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text className="absolute bottom-0 right-0 p-2 opacity-20">{UPDATE_VERSION}</Text>
    </SafeAreaView>
  );
};
