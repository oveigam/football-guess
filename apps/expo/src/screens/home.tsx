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
    <SafeAreaView className="h-full bg-purple-50">
      <View className="flex h-full w-full items-center justify-center gap-y-8">
        <View className="flex items-center justify-center">
          <Text className="text-8xl font-semibold text-purple-400">Football</Text>
          <Text className="text-8xl font-bold">Guess</Text>
        </View>
        <View className="mb-24 flex items-center gap-y-2">
          <Button
            label="New Game"
            onPress={() => {
              createGame();
            }}
          />
          <View className="flex flex-row items-center justify-center">
            <TextInput
              className="mr-1 rounded-xl border border-purple-300 bg-white p-3"
              maxLength={4}
              placeholder="CODE"
              value={code}
              onChangeText={setCode}
            />
            <Button
              label="Join"
              onPress={() => {
                joinLobby({ code });
              }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
