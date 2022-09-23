import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import dayjs from "dayjs";
import { useMemo } from "react";

const pointDistribution = {
  team: 1,
  competition: 1,
  nationality: 1,
  position: 1,
  age: 1,
  shirtNumber: 1,
  player: 1,
};

interface Params {
  guesses: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["guesses"];
  solution: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["solution"];
  gamePlayers: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["gamePlayers"];
}

const useGamePoints = ({ guesses, solution, gamePlayers }: Params) => {
  return useMemo(() => {
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
  }, [guesses, solution]);
};

export default useGamePoints;
