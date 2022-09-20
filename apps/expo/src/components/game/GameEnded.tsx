import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import { FC, useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, Image, TouchableOpacity } from "react-native";
import Button from "../common/buttons/Button";
import Guess from "./Guess";
import { trpc } from "./../../utils/trpc";
import { GamePlayer } from "@prisma/client";
import dayjs from "dayjs";

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

const GameEnded: FC<Props> = ({ gameId, guesses, myId, solution, gamePlayers }) => {
  const { mutate: startGame } = trpc.game.startGame.useMutation();

  const puntuaciones = useMemo(() => {
    const pointMap = new Map<number, number>();
    const points = { ...pointDistribution };
    for (const { guess, gamePlayer } of guesses) {
      if (gamePlayer) {
        const puntos = pointMap.get(gamePlayer.id) || 0;
        let sumar = 0;
        if (guess.team.competitionId === solution.team.competitionId && points.competition) {
          sumar++;
          points.competition = 0;
        }
        if (guess.teamId === solution.teamId && points.team) {
          sumar++;
          points.team = 0;
        }
        if (guess.nationality === solution.nationality && points.nationality) {
          sumar++;
          points.nationality = 0;
        }
        if (guess.position === solution.position && points.position) {
          sumar++;
          points.position = 0;
        }
        const age = dayjs().diff(guess.birth, "years");
        const solutionAge = dayjs().diff(solution.birth, "years");
        if (age === solutionAge && points.age) {
          sumar++;
          points.age = 0;
        }
        if (guess.shirtNumber === solution.shirtNumber && points.shirtNumber) {
          sumar++;
          points.shirtNumber = 0;
        }
        if (
          points.player &&
          guess.team.competitionId === solution.team.competitionId &&
          guess.teamId === solution.teamId &&
          guess.nationality === solution.nationality &&
          guess.position === solution.position &&
          age === solutionAge &&
          guess.shirtNumber === solution.shirtNumber
        ) {
          sumar++;
          sumar++;
          points.player = 0;
        }
        pointMap.set(gamePlayer.id, puntos + sumar);
      }
    }
    return gamePlayers.map((p) => ({ ...p, points: pointMap.get(p.id) || 0 })).sort((a, b) => b.points - a.points);
  }, [guesses]);

  return (
    <View className="flex flex-1 py-2">
      <Guess solution={guesses[guesses.length - 1].guess} guess={guesses[guesses.length - 1]} />
      <View className="mb-2 flex items-center">
        <Button label="Play Again" onPress={() => startGame({ gameId })} />
      </View>
      <FlatList
        className="w-full px-4"
        keyboardShouldPersistTaps="always"
        data={puntuaciones}
        renderItem={({ item }) => {
          return (
            <View key={item.id} className="mb-2 flex flex-row gap-x-2 rounded-xl bg-white p-4">
              <Text className={`text-xl font-bold ${item.id === myId ? "text-primary-700" : "text-primary-500"}`}>
                {item.name}:
              </Text>
              <Text className="text-primary-500 text-xl">{item.points}</Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default GameEnded;
