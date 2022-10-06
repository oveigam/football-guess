import { FC, useState } from "react";
import { trpc } from "../../utils/trpc";
import { Combobox } from "@headlessui/react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "@fooguess/api";

interface Props {
  gameId: number;
  myId: number;
  solutionCheat: string;
}

const GamePlayerSearcher: FC<Props> = ({ gameId, myId, solutionCheat }) => {
  const [search, setSearch] = useState("");

  const { data: players } = trpc.player.searchPlayer.useQuery({ search }, { keepPreviousData: true });
  const { mutate: makeAGuess } = trpc.game.makeAGuess.useMutation();

  return (
    <div className="relative w-5/6">
      <label className="text-primary-50 text-xs">{solutionCheat}</label>
      <div className="flex justify-between">
        <label className="text-primary-500 ml-1 mb-[1px] text-xs font-semibold">Search player</label>
      </div>
      <Combobox onChange={(playerId: number) => makeAGuess({ gameId, playerId, myId })}>
        <Combobox.Input
          className="border-primary-500 w-full rounded-xl border px-4 py-2"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Combobox.Options className="border-primary-500 absolute mt-1 w-full rounded-xl border bg-white p-2">
          {players?.map((player, index) => (
            <Combobox.Option
              key={player.id}
              className={`cursor-pointer p-2 hover:bg-slate-50 active:bg-slate-100 ${
                index !== players.length - 1 && "border-primary-100 border-b"
              }`}
              value={player.id}
            >
              {player.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default GamePlayerSearcher;
