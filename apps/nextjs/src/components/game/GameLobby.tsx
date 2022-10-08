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
  const { mutate: startGame } = trpc.game.startGame.useMutation();

  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-16">
      <h1 className="text-primary-700 text-5xl font-bold">
        Code: <span className="text-primary-400">{game.code}</span>
      </h1>
      <Button onClick={() => startGame({ code: game.code })}>Start Game</Button>
      <ul className="flex w-2/3 flex-col gap-2">
        {game.users.map(({ id, name }) => {
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
