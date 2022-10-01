import { Position } from ".prisma/client";
import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import dayjs from "dayjs";
import { FC, ReactNode } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-root-toast";
import { SvgUri } from "react-native-svg";

let lastToast: any;

type IndicatorProps = { label: string; isCorrect: boolean; toast: string; children: ReactNode };

const GuessIndicator: FC<IndicatorProps> = ({ label, isCorrect, toast, children }) => {
  return (
    <View className={`mx-0.5 flex w-full flex-1 items-center justify-center`}>
      <TouchableOpacity
        onPress={() => {
          if (lastToast) {
            Toast.hide(lastToast);
          }
          lastToast = Toast.show(toast, { duration: Toast.durations.SHORT });
        }}
      >
        <View
          className={`flex aspect-square w-full items-center justify-center rounded-full p-2 ${
            isCorrect ? "bg-primary-300" : "bg-slate-200"
          }`}
        >
          {children}
        </View>
      </TouchableOpacity>
      <Text className="mt-1 text-xs font-semibold">{label}</Text>
    </View>
  );
};

const Crest: FC<{ url: string }> = ({ url }) => {
  const isSvg = url.includes(".svg");
  return isSvg ? (
    <SvgUri width="100%" height="100%" uri={url} />
  ) : (
    <Image className="h-5/6 w-5/6" source={{ uri: url }} />
  );
};

function getPos(position: Position) {
  switch (position) {
    case "Goalkeeper":
      return "GK";
    case "Defence":
      return "DF";
    case "Midfield":
      return "MF";
    case "Offence":
      return "FW";
  }
}

function getElementPos(index: number) {
  switch (index) {
    case 0:
      return "1st";
    case 1:
      return "2nd";
    case 2:
      return "3rd";

    default:
      return `${index + 1}th`;
  }
}

interface Props {
  index?: number;
  solution: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["solution"];
  guess: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["guesses"][number];
}

const Guess: FC<Props> = ({ solution, guess, index }) => {
  const {
    guess: { team, nationality, position, birth, shirtNumber },
  } = guess;

  const competition = team.competition;

  const age = dayjs().diff(birth, "years");
  const solutionAge = dayjs().diff(solution.birth, "years");

  let ageArrow = "";
  if (age > solutionAge) {
    ageArrow = "↓";
  } else if (age < solutionAge) {
    ageArrow = "↑";
  }

  let shirtArrow = "";
  if (shirtNumber > solution.shirtNumber) {
    shirtArrow = "↑";
  } else if (shirtNumber < solution.shirtNumber) {
    shirtArrow = "↓";
  }

  return (
    <View className="mx-2 mb-2 flex rounded-xl bg-white px-1 pb-1">
      {index !== undefined && (
        <View className="relative">
          <Text className="absolute top-1 left-1 font-semibold">{getElementPos(index)}</Text>
        </View>
      )}
      <Text className="text-primary-600 mb-0.5 text-center text-2xl font-bold">{guess.guess.name}</Text>
      <View className="flex flex-row">
        <GuessIndicator label="NAT" toast={nationality} isCorrect={nationality === solution.nationality}>
          <Image
            className="h-full w-full rounded-full"
            source={{ uri: `https://countryflagsapi.com/png/${nationality.toLowerCase()}` }}
          />
        </GuessIndicator>
        <GuessIndicator label="LGE" toast={competition.name} isCorrect={competition.id === solution.team.competitionId}>
          <Crest url={competition.emblem} />
        </GuessIndicator>
        <GuessIndicator label="TEAM" toast={team.name} isCorrect={team.id === solution.teamId}>
          <Crest url={team.crest} />
        </GuessIndicator>
        <GuessIndicator label="POS" toast={position} isCorrect={position === solution.position}>
          <Text className="text-lg font-bold">{getPos(position)}</Text>
        </GuessIndicator>
        <GuessIndicator label="AGE" toast={birth} isCorrect={age === solutionAge}>
          <Text className="text-lg font-bold">
            {age}
            {ageArrow}
          </Text>
        </GuessIndicator>
        <GuessIndicator label="SHIRT" toast={`#${shirtNumber}`} isCorrect={shirtNumber === solution.shirtNumber}>
          <Text className="text-lg font-bold">
            #{shirtNumber}
            {shirtArrow}
          </Text>
        </GuessIndicator>
      </View>
    </View>
  );
};

export default Guess;
