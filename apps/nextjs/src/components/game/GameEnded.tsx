import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC, useMemo } from "react";
import useGamePoints from "../../hooks/useGamePoints";
import { trpc } from "../../utils/trpc";
import Button from "../common/Button";
import Guess from "./Guess";

const pointDistribution = {
  team: 1,
  competition: 1,
  nationality: 1,
  position: 1,
  age: 1,
  shirtNumber: 1,
  player: 1,
};

interface Props {
  gameId: number;
  guesses: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["guesses"];
  solution: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["solution"];
  gamePlayers: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["gamePlayers"];
  myId: number;
}

const GameEnded: FC<Props> = ({ gameId, guesses, solution, gamePlayers, myId }) => {
  const { mutate: startGame } = trpc.game.startGame.useMutation();

  const points = useGamePoints({ guesses, solution, gamePlayers });

  const lastGuess = guesses[guesses.length - 1];
  if (!lastGuess) {
    return null;
  }
  return (
    <div className="flex flex-col items-center justify-center gap-8 pt-2">
      <Guess solution={solution} guess={lastGuess} />
      <Button onClick={() => startGame({ gameId })}>Play Again</Button>
      <ul className="w-2/3 flex flex-col gap-2">
        {points.map(({ id, name, points }) => {
          const textColor = myId === id ? "text-primary-700" : "text-primary-400";
          return (
            <li key={id} className={`rounded-xl bg-white p-4 text-center text-xl font-semibold ${textColor}`}>
              {`${name}: `}
              <span className="text-primary-500 text-xl">{points}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default GameEnded;
