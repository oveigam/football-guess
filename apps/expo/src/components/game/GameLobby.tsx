import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import { FlatList, Text, View } from "react-native";
import Button from "../common/buttons/Button";
import { trpc } from "./../../utils/trpc";

type UserTextProps = { text: string };

const UserText: FC<UserTextProps> = ({ text }) => <Text className="font-semibold text-primary-500">{text}</Text>;
const MeText: FC<UserTextProps> = ({ text }) => <Text className="font-bold text-primary-700">{text}</Text>;

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameLobby: FC<Props> = ({ game, myId }) => {
  const query = trpc.useContext();

  const { mutate: startGame } = trpc.game.startGame.useMutation({
    onError(err) {
      console.log(err);
    },
  });

  trpc.game.newPlayer.useSubscription(
    { code: game.code },
    {
      onData(newGamePlayer) {
        query.game.getGame.setData(
          (old) => {
            if (!old) return null;
            return {
              ...old,
              gamePlayers: [...old.gamePlayers, newGamePlayer],
            };
          },
          { id: game.id },
        );
      },
    },
  );

  trpc.game.playerLeft.useSubscription(
    { gameId: game.id },
    {
      onData({ gamePlayerId }) {
        query.game.getGame.setData(
          (old) => {
            if (!old) return null;
            return {
              ...old,
              gamePlayers: old.gamePlayers?.filter(({ id }) => gamePlayerId !== id),
            };
          },
          { id: game.id },
        );
      },
    },
  );

  return (
    <View className="flex items-center gap-y-4 py-24">
      <View className="flex flex-row">
        <Text className="text-5xl font-bold text-primary-700">Code: </Text>
        <Text className="text-5xl font-bold text-primary-500">{game.code}</Text>
      </View>
      <View>
        <Button label="start game" onPress={() => startGame({ gameId: game.id })} />
      </View>
      <FlatList
        className="w-2/3"
        data={game.gamePlayers}
        renderItem={({ item: { id, name } }) => {
          return (
            <View key={id} className="my-1 rounded-xl bg-white p-4">
              {myId === id ? <MeText text={name} /> : <UserText text={name} />}
            </View>
          );
        }}
      />
    </View>
  );
};

export default GameLobby;
