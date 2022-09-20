import React, { FC, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/common/buttons/Button";
import { ScreenProps } from "../utils/navigation";
import { trpc } from "../utils/trpc";

export const HomeScreen: FC<ScreenProps<"Home">> = ({ navigation }) => {
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
      <View className="flex h-full w-full items-center justify-center gap-y-8">
        <View className="flex items-center justify-center">
          <Text className="text-primary-500 text-8xl font-semibold">Football</Text>
          <Text className="text-primary-700 text-8xl font-bold">Guess</Text>
        </View>
        <View className="mb-24 flex items-center gap-y-2">
          <Button
            label="New Game"
            onPress={() => {
              setCode("");
              createGame();
            }}
          />
          <View className="flex flex-row items-center justify-center">
            <TextInput
              className="border-primary-100 mr-1 rounded-xl border bg-white p-3"
              maxLength={4}
              placeholder="CODE"
              value={code}
              onChangeText={setCode}
            />
            <Button
              label="Join"
              onPress={() => {
                setCode("");
                joinLobby({ code: code.toLowerCase() });
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
