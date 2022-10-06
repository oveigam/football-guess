import { FC, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";
import { trpc } from "./../../utils/trpc";

interface Props {
  gameId: number;
  myId: number;
  solutionCheat: string;
}

const GamePlayerSearcher: FC<Props> = ({ gameId, myId, solutionCheat }) => {
  const [search, setSearch] = useState("");

  const { data: players } = trpc.player.searchPlayer.useQuery({ search }, { keepPreviousData: true });

  const { mutate: makeAGuess } = trpc.game.makeAGuess.useMutation();

  return (
    <View className="mx-2 mb-2 flex rounded-xl bg-white p-2">
      <View className="flex flex-row">
        <Text className="text-primary-500 ml-1 mb-[1px] text-xs font-semibold">Buscar jugador</Text>
        <TouchableOpacity
          className="ml-auto h-4 w-12"
          onLongPress={() => {
            Toast.show(solutionCheat);
          }}
        />
      </View>
      <TextInput
        className="border-primary-500 w-full rounded-xl border px-4 py-1"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        className="max-h-60"
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        data={players}
        ItemSeparatorComponent={() => {
          return <View className="bg-primary-50 h-[1px]" />;
        }}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              key={item.id}
              className="p-4"
              onPress={() => {
                makeAGuess({ gameId, playerId: item.id, myId });
                setSearch("");
              }}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default GamePlayerSearcher;
