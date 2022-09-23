import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import { trpc } from "../../utils/trpc";
import Button from "../common/Button";

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameLobby: FC<Props> = ({ game, myId }) => {
  const query = trpc.useContext();

  const { mutate: startGame } = trpc.game.startGame.useMutation();

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
    <div className="flex flex-col items-center justify-center gap-8 pt-16">
      <h1 className="text-primary-700 text-5xl font-bold">
        Code: <span className="text-primary-400">{game.code}</span>
      </h1>
      <Button onClick={() => startGame({ gameId: game.id })}>Start Game</Button>
      <ul className="flex w-2/3 flex-col gap-2">
        {game.gamePlayers.map(({ id, name }) => {
          const textColor = myId === id ? "text-primary-700" : "text-primary-400";
          return (
            <li key={id} className={`rounded-xl bg-white p-4 text-center text-xl font-semibold ${textColor}`}>
              {name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GameLobby;
