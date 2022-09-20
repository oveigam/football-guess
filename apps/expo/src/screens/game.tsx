import { FC, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GameEnded from "../components/game/GameEnded";
import GameLobby from "../components/game/GameLobby";
import GameRunning from "../components/game/GameRunning";
import { ScreenProps } from "../utils/navigation";
import { trpc } from "./../utils/trpc";

export const GameScreen: FC<ScreenProps<"Game">> = ({ route }) => {
  const { gameId, myId } = route.params;

  const query = trpc.useContext();

  const { data: game } = trpc.game.getGame.useQuery({ id: gameId });

  const { mutate: leave } = trpc.game.leaveGame.useMutation();

  trpc.game.gameStarted.useSubscription(
    { gameId },
    {
      onData() {
        query.game.getGame.invalidate({ id: gameId });
      },
    },
  );

  useEffect(() => {
    return () => {
      if (myId) {
        leave({ gamePlayerId: myId });
      }
    };
  }, [leave, myId]);

  if (!game) {
    return null;
  }
  return (
    <SafeAreaView className="h-full bg-purple-50">
      {game.status === "Lobby" && <GameLobby game={game} myId={myId} />}
      {game.status === "Playing" && <GameRunning game={game} myId={myId} />}
      {game.status === "Ended" && (
        <GameEnded guesses={game.guesses} solution={game.solution} myId={myId} gamePlayers={game.gamePlayers} gameId={gameId} />
      )}
    </SafeAreaView>
  );
};
