import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import { FlatList, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Button from "../common/buttons/Button";
import { trpc } from "./../../utils/trpc";

type UserTextProps = { text: string };

const UserText: FC<UserTextProps> = ({ text }) => <Text className="text-primary-500 font-semibold">{text}</Text>;
const MeText: FC<UserTextProps> = ({ text }) => <Text className="text-primary-700 font-bold">{text}</Text>;

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameLobby: FC<Props> = ({ game, myId }) => {
  const { mutate: startGame } = trpc.game.startGame.useMutation({});

  return (
    <View className="flex h-full items-center gap-y-2 py-8">
      <View className="flex flex-row gap-x-2">
        <QRCode value={game.code} />
        <View>
          <Text className="text-primary-600 mb-2 text-xl opacity-60">Game Code</Text>
          <Text className="text-primary-700 text-7xl font-bold">{game.code}</Text>
        </View>
      </View>
      <View className="flex w-full flex-1 items-center">
        <FlatList
          className="w-full flex-1"
          data={game.users}
          renderItem={({ item: { id, name } }) => {
            return (
              <View key={id} className="my-1 mx-auto w-5/6 rounded-xl bg-white p-4">
                {myId === id ? <MeText text={name} /> : <UserText text={name} />}
              </View>
            );
          }}
        />
      </View>
      <Text className="text-primary-600 text-center font-bold opacity-60">
        {game.users.length} player{game.users.length > 1 && "s"} on lobby
      </Text>
      <View>
        <Button label="start game" onPress={() => startGame({ code: game.code })} />
      </View>
    </View>
  );
};

export default GameLobby;
