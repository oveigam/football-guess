import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import { FlatList, Text, View } from "react-native";
import Button from "../common/buttons/Button";
import { trpc } from "./../../utils/trpc";
import Guess from "./Guess";

interface Props {
  code: string;
  guesses: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["guesses"];
  solution: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["solution"];
  users: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["users"];
  myId: number;
}

const GameEnded: FC<Props> = ({ code, guesses, myId, solution, users }) => {
  const { mutate: startGame } = trpc.game.startGame.useMutation();

  return (
    <View className="flex flex-1 py-2">
      <Guess solution={solution} guess={solution} />
      <View className="mb-2 flex items-center">
        <Button label="Play Again" onPress={() => startGame({ code })} />
      </View>
      <FlatList
        className="w-full px-4"
        keyboardShouldPersistTaps="always"
        data={users}
        renderItem={({ item }) => {
          return (
            <View key={item.id} className="mb-2 flex flex-row gap-x-2 rounded-xl bg-white p-4">
              <Text className={`text-xl font-bold ${item.id === myId ? "text-primary-700" : "text-primary-500"}`}>
                {item.name}:
              </Text>
              <Text className="text-primary-500 text-xl">{`${item.points} (${item.totalPoints} total)`}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default GameEnded;
