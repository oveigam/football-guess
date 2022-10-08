import { atom, useAtom } from "jotai";

type GameInfo = {
  code: string;
  myId: number;
};

const gameInfoAtom = atom<GameInfo | null>(null);

export const useGameInfo = () => {
  return useAtom(gameInfoAtom);
};
