import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import GameEnded from "../components/game/GameEnded";
import GameLobby from "../components/game/GameLobby";
import GameRunning from "../components/game/GameRunning";
import { useGameInfo } from "../hooks/useGameInfo";
import { trpc } from "../utils/trpc";

interface Props {
  code: string;
  myId: number;
}

const Game: FC<Props> = ({ code, myId }) => {
  const query = trpc.useContext();

  const { data: game } = trpc.game.getGame.useQuery({ code });

  const { mutate: leave } = trpc.game.leaveGame.useMutation();

  trpc.game.game.useSubscription(
    { code },
    {
      onData(game) {
        query.game.getGame.setData(() => game, { code });
      },
    },
  );

  if (!game) {
    return null;
  }
  return (
    <>
      {game.status === "Lobby" && <GameLobby game={game} myId={myId} />}
      {game.status === "Playing" && <GameRunning game={game} myId={myId} />}
      {game.status === "Ended" && (
        <GameEnded guesses={game.guesses} solution={game.solution} myId={myId} users={game.users} code={code} />
      )}
    </>
  );
};

const GamePage: NextPage = () => {
  const router = useRouter();
  const [gameInfo] = useGameInfo();

  useEffect(() => {
    if (!gameInfo) {
      router.replace("/");
    }
  }, [gameInfo, router]);

  return (
    <main className="bg-primary-50 mx-auto min-h-screen">
      <div className="mx-auto min-h-screen max-w-2xl">
        {gameInfo && <Game code={gameInfo.code} myId={gameInfo.myId} />}
      </div>
    </main>
  );
};

export default GamePage;
