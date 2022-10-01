import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC, useEffect, useRef } from "react";
import { FlatList, View } from "react-native";
import { trpc } from "./../../utils/trpc";
import GamePlayerSearcher from "./GamePlayerSearcher";
import Guess from "./Guess";

interface Props {
  game: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>;
  myId: number;
}

const GameRunning: FC<Props> = ({ game, myId }) => {
  const { guesses, solution } = game;

  const listRef = useRef<FlatList<typeof guesses[number]> | null>();

  const guessCount = guesses.length;
  useEffect(() => {
    listRef.current?.scrollToEnd();
  }, [guessCount]);

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
    <View className="flex-1">
      <GamePlayerSearcher gameId={game.id} myId={myId} solutionCheat={solution.name} />
      <FlatList
        // @ts-ignore
        ref={listRef}
        className="w-full"
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        data={guesses}
        renderItem={({ item, index }) => {
          return <Guess key={item.id} index={index} solution={solution} guess={item} />;
        }}
      />
    </View>
  );
};

export default GameRunning;
