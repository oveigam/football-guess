import { Combobox } from "@headlessui/react";
import Image from "next/future/image";
import { FC, useState } from "react";
import { trpc } from "../../utils/trpc";

interface Props {
  code: string;
  myId: number;
  solutionCheat: string;
}

const GamePlayerSearcher: FC<Props> = ({ code, myId, solutionCheat }) => {
  const [search, setSearch] = useState("");

  const { data: players } = trpc.player.searchPlayer.useQuery({ search }, { keepPreviousData: true });
  const { mutate: makeAGuess } = trpc.game.makeAGuess.useMutation();

  return (
    <div className="relative w-full">
      <label className="text-primary-50 text-xs">{solutionCheat}</label>
      <div className="flex justify-between">
        <label className="text-primary-500 ml-1 mb-[1px] text-xs font-semibold">Search player</label>
      </div>
      <Combobox onChange={(playerId: number) => makeAGuess({ code, playerId, userId: myId })}>
        <Combobox.Input
          autoComplete="off"
          className="border-primary-500 w-full rounded-xl border px-4 py-2"
          onChange={(event) => setSearch(event.target.value)}
        />
        <Combobox.Options className="border-primary-500 absolute z-40 mt-1 max-h-56 w-full overflow-x-auto rounded-xl border bg-white p-2">
          {players?.map((player, index) => (
            <Combobox.Option
              key={player.id}
              className={`cursor-pointer p-2 hover:bg-slate-50 active:bg-slate-100 ${
                index !== players.length - 1 && "border-primary-100 border-b"
              }`}
              value={player.id}
            >
              <Image width={24} height={24} src={player.photo} />
              <span>{player.name}</span>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default GamePlayerSearcher;
