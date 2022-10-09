import { Position } from ".prisma/client";
import { AppRouter } from "@fooguess/api";
import { inferProcedureOutput } from "@trpc/server";
import Image from "next/future/image";
import { FC, ReactNode } from "react";

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

interface IndicatorProps {
  label: string;
  isCorrect: boolean;
  tooltip: string;
  children: ReactNode;
}

const GuessIndicator: FC<IndicatorProps> = ({ label, tooltip, isCorrect, children }) => {
  return (
    <div className="flex flex-1 cursor-default flex-col items-center justify-center gap-1">
      <div
        title={tooltip}
        className={`flex aspect-square w-full items-center justify-center rounded-full p-2 ${
          isCorrect ? "bg-primary-300" : "bg-slate-200"
        }`}
      >
        {children}
      </div>
      <h3 className="text-xs font-bold">{label}</h3>
    </div>
  );
};

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
    shirtArrow = "↑";
  } else if (shirtNumber < solution.shirtNumber) {
    shirtArrow = "↓";
  }

  return (
    <li className="flex flex-col gap-1 rounded-xl bg-white p-1 pb-2">
      <div className="mb-1 flex items-end gap-2">
        <Image width={50} height={50} src={photo} />
        <h2 className="text-primary-500 text-center text-2xl font-bold">{name}</h2>
        <caption className="ml-auto self-start pt-0.5 pr-2 font-semibold opacity-50">{user?.name}</caption>
      </div>
      <div className="flex gap-1">
        <GuessIndicator label="NAT" tooltip={nationality} isCorrect={nationality === solution.nationality}>
          <img
            className="aspect-square h-full w-full rounded-full"
            src={`https://countryflagsapi.com/png/${nationality.toLowerCase()}`}
          />
        </GuessIndicator>
        <GuessIndicator label="LGE" tooltip={competition.name} isCorrect={competition.id === solution.competition.id}>
          <img className="aspect-square h-full w-full rounded-full" src={competition.emblem} />
        </GuessIndicator>
        <GuessIndicator label="TEAM" tooltip={team.name} isCorrect={team.id === solution.team.id}>
          <img className="aspect-square h-full w-full rounded-full" src={team.crest} />
        </GuessIndicator>
        <GuessIndicator label="POS" tooltip={position} isCorrect={position === solution.position}>
          <h4 className="text-lg font-bold">{getPos(position)}</h4>
        </GuessIndicator>
        <GuessIndicator label="AGE" tooltip={age.toString()} isCorrect={age === solution.age}>
          <h4 className="text-lg font-bold">
            {age}
            {ageArrow}
          </h4>
        </GuessIndicator>
        <GuessIndicator label="SHIRT" tooltip={`#${shirtNumber}`} isCorrect={shirtNumber === solution.shirtNumber}>
          <h4 className="text-lg font-bold">
            #{shirtNumber}
            {shirtArrow}
          </h4>
        </GuessIndicator>
      </div>
    </li>
  );
};

export default Guess;
