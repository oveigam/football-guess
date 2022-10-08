import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC, useEffect, useRef } from "react";
import { FlatList, View } from "react-native";
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

  return (
    <View className="flex-1">
      <GamePlayerSearcher code={game.code} myId={myId} solutionCheat={solution.name} />
      <FlatList
        // @ts-ignore
        ref={listRef}
        className="w-full"
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        data={guesses}
        renderItem={({ item }) => {
          const user = game.users.find(({ id }) => id === item.userId);
          return <Guess key={item.id} user={user} solution={solution} guess={item} />;
        }}
      />
    </View>
  );
};

export default GameRunning;
