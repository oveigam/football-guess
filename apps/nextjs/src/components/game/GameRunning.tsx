import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC, LegacyRef, useEffect, useRef } from "react";
import GamePlayerSearcher from "./GamePlayerSearcher";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Guess from "./Guess";
import HealthIndicator from "./HealthIndicator";

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameRunning: FC<Props> = ({ game, myId }) => {
  const { guesses, solution, users } = game;

  const [list] = useAutoAnimate();
  const bottomRef = useRef<HTMLLIElement>();

  const guessCount = guesses.length;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [guessCount]);

  const me = users.find(({ id }) => id === myId);

  return (
    <div className="flex h-screen flex-col items-center gap-2">
      <div className="flex w-full items-end justify-between gap-6">
        <GamePlayerSearcher code={game.code} myId={myId} solutionCheat={solution.name} />
        <HealthIndicator health={me?.lives || 0} />
      </div>
      <ul ref={list as LegacyRef<HTMLUListElement>} className="flex w-full flex-1 flex-col gap-2 overflow-x-auto">
        {guesses.map((guess) => {
          const user = users.find(({ id }) => id === guess.userId);
          return <Guess key={guess.id} guess={guess} solution={solution} user={user} />;
        })}
        <li ref={bottomRef as LegacyRef<HTMLLIElement>} />
      </ul>
    </div>
  );
};

export default GameRunning;
