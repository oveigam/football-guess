import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC } from "react";
import { trpc } from "../../utils/trpc";
import GamePlayerSearcher from "./GamePlayerSearcher";
import Guess from "./Guess";

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameRunning: FC<Props> = ({ game, myId }) => {
  const { guesses, solution } = game;
  const query = trpc.useContext();

  trpc.game.guessMade.useSubscription(
    { gameId: game.id },
    {
      onData({ guesses, status }) {
        if (status === "Ended") {
        }
        query.game.getGame.setData(
          (old) => {
            if (!old) return null;
            return {
              ...old,
              status,
              guesses,
            };
          },
          { id: game.id },
        );
      },
    },
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <GamePlayerSearcher gameId={game.id} myId={myId} solutionCheat={solution.name} />
      <ul className="flex flex-col-reverse gap-2">
        {guesses.map((guess) => (
          <Guess key={guess.id} guess={guess} solution={solution} />
        ))}
      </ul>
    </div>
  );
};

export default GameRunning;
