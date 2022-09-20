import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";
import { trpc } from "./../../utils/trpc";
import Guess from "./Guess";

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameRunning: FC<Props> = ({ game, myId }) => {
  const { guesses, solution } = game;

  const [search, setSearch] = useState("");

  const query = trpc.useContext();

  const { data: players } = trpc.player.searchPlayer.useQuery({ search });

  const { mutate: makeAGuess } = trpc.game.makeAGuess.useMutation();

  trpc.game.guessMade.useSubscription(
    { gameId: game.id },
    {
      onData({ guesses, status }) {
        if (status === "Ended") {
        }
        query.game.getGame.setData(
          (old) => {
            if (!old) return null;
            return {
              ...old,
              status,
              guesses,
            };
          },
          { id: game.id },
        );
      },
    },
  );

  return (
    <View className="flex gap-y-4 py-4">
      <View className="flex max-h-60 rounded-xl bg-white p-2">
        <View className="flex flex-row">
          <Text className="text-xs text-purple-500">Buscar jugador</Text>
          <TouchableOpacity
            className="ml-auto h-3 w-3"
            onLongPress={() => {
              Toast.show(solution.name);
            }}
          />
        </View>
        <TextInput
          className="w-full rounded-xl border border-purple-300 px-4 py-1"
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          keyboardShouldPersistTaps="always"
          data={players}
          ItemSeparatorComponent={() => {
            return <View className="h-[1px] bg-purple-200" />;
          }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                key={item.id}
                className="p-4"
                onPress={() => {
                  makeAGuess({ gameId: game.id, playerId: item.id, myId });
                  setSearch("");
                }}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      <FlatList
        className="w-full"
        keyboardShouldPersistTaps="always"
        data={guesses}
        renderItem={({ item }) => {
          return <Guess key={item.id} solution={solution} guess={item} />;
        }}
      />
    </View>
  );
};

export default GameRunning;
