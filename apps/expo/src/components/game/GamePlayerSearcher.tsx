import { FC, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import Toast from "react-native-root-toast";
import { trpc } from "./../../utils/trpc";
import HealthIndicator from "./HealthIndicator";

interface Props {
  code: string;
  myId: number;
  solutionCheat: string;
  health: number;
}

const GamePlayerSearcher: FC<Props> = ({ code, myId, solutionCheat, health }) => {
  const [search, setSearch] = useState("");

  const { data: players } = trpc.player.searchPlayer.useQuery({ search }, { keepPreviousData: true });

  const { mutate: makeAGuess } = trpc.game.makeAGuess.useMutation();

  return (
    <View className="mx-2 mb-2 flex rounded-xl bg-white p-2">
      <View className="flex flex-row items-end justify-between gap-x-6">
        <View className="flex-1">
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
        </View>
        <HealthIndicator health={health} />
      </View>
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
              className="my-auto flex flex-row items-center py-4 px-2"
              onPress={() => {
                makeAGuess({ code, userId: myId, playerId: item.id });
                setSearch("");
              }}
            >
              <Image className="h-[24px] w-[24px]" source={{ uri: item.photo }} />
              <Text className="leading-none">{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default GamePlayerSearcher;
