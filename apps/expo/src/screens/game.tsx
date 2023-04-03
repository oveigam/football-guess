import { FC, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GameEnded from "../components/game/GameEnded";
import GameLobby from "../components/game/GameLobby";
import GameRunning from "../components/game/GameRunning";
import { ScreenProps } from "../utils/navigation";
import { trpc } from "./../utils/trpc";

export const GameScreen: FC<ScreenProps<"Game">> = ({ route }) => {
  const { code, myId } = route.params;

  const query = trpc.useContext();

  const { data: game } = trpc.game.getGame.useQuery({ code });

  const { mutate: leave } = trpc.game.leaveGame.useMutation();

  trpc.game.game.useSubscription(
    { code },
    {
      onData(game) {
        query.game.getGame.setData({ code }, game);
      },
    },
  );

  useEffect(() => {
    return () => {
      if (myId) {
        leave({ code, userId: myId });
      }
    };
  }, [leave, myId]);

  if (!game) {
    return null;
  }
  return (
    <SafeAreaView className="bg-primary-50 h-full">
      {game.status === "Lobby" && <GameLobby game={game} myId={myId} />}
      {game.status === "Playing" && <GameRunning game={game} myId={myId} />}
      {game.status === "Ended" && (
        <GameEnded guesses={game.guesses} solution={game.solution} myId={myId} users={game.users} code={code} />
      )}
    </SafeAreaView>
  );
};
