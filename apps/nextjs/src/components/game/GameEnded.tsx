import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import { trpc } from "../../utils/trpc";
import Button from "../common/Button";
import Guess from "./Guess";

interface Props {
  code: string;
  guesses: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["guesses"];
  solution: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["solution"];
  users: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["users"];
  myId: number;
}

const GameEnded: FC<Props> = ({ code, guesses, myId, solution, users }) => {
  const { mutate: startGame } = trpc.game.startGame.useMutation();

  const lastGuess = guesses[guesses.length - 1];
  if (!lastGuess) {
    return null;
  }
  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-2">
      <Guess solution={solution} guess={lastGuess} />
      <Button onClick={() => startGame({ code })}>Play Again</Button>
      <ul className="flex w-2/3 flex-col gap-2">
        {users.map(({ id, name, points, totalPoints }) => {
          const textColor = myId === id ? "text-primary-700" : "text-primary-400";
          return (
            <li key={id} className={`rounded-xl bg-white p-4 text-center text-xl font-semibold ${textColor}`}>
              {`${name}: `}
              <span className="text-primary-500 text-xl">{`${points} (${totalPoints} total)`}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GameEnded;
