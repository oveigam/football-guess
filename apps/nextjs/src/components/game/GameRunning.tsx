import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import GamePlayerSearcher from "./GamePlayerSearcher";
import Guess from "./Guess";

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameRunning: FC<Props> = ({ game, myId }) => {
  const { guesses, solution } = game;
  return (
    <div className="flex flex-col items-center gap-2">
      <GamePlayerSearcher code={game.code} myId={myId} solutionCheat={solution.name} />
      <ul className="flex flex-col-reverse gap-2">
        {guesses.map((guess) => (
          <Guess key={guess.id} guess={guess} solution={solution} />
        ))}
      </ul>
    </div>
  );
};

export default GameRunning;
