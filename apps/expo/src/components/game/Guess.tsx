import { Position } from ".prisma/client";
import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
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

interface Props {
  user?: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["users"][number];
  solution: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["solution"];
  guess: NonNullable<inferProcedureOutput<AppRouter["game"]["getGame"]>>["guesses"][number];
}

const Guess: FC<Props> = ({ solution, guess, user }) => {
  const { name, photo, nationality, competition, team, position, age, shirtNumber } = guess;

  let ageArrow = "";
  if (age > solution.age) {
    ageArrow = "↓";
  } else if (age < solution.age) {
    ageArrow = "↑";
  }

  let shirtArrow = "";
  if (shirtNumber > solution.shirtNumber) {
    shirtArrow = "↓";
  } else if (shirtNumber < solution.shirtNumber) {
    shirtArrow = "↑";
  }

  return (
    <View className="mx-2 mb-2 flex rounded-xl bg-white px-1 pb-1">
      <View className="mb-1 flex flex-row items-end gap-x-2">
        <Image className="h-[50px] w-[50px]" source={{ uri: photo }} />
        <Text className="text-primary-600 mb-0.5 flex-1 text-2xl font-bold md:text-xl">{name}</Text>
        <Text className="mb-auto p-2 font-semibold opacity-40">{user?.name}</Text>
      </View>
      <View className="flex flex-row">
        <GuessIndicator label="NAT" toast={nationality} isCorrect={nationality === solution.nationality}>
          <Image
            className="h-full w-full rounded-full"
            source={{ uri: `https://countryflagsapi.com/png/${nationality.toLowerCase()}` }}
          />
        </GuessIndicator>
        <GuessIndicator label="LGE" toast={competition.name} isCorrect={competition.id === solution.competition.id}>
          <Crest url={competition.emblem} />
        </GuessIndicator>
        <GuessIndicator label="TEAM" toast={team.name} isCorrect={team.id === solution.team.id}>
          <Crest url={team.crest} />
        </GuessIndicator>
        <GuessIndicator label="POS" toast={position} isCorrect={position === solution.position}>
          <Text className="text-lg font-bold">{getPos(position)}</Text>
        </GuessIndicator>
        <GuessIndicator label="AGE" toast={age.toString()} isCorrect={age === solution.age}>
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
