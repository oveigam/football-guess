import { atom, useAtom } from "jotai";

type GameInfo = {
  gameId: number;
  myId: number;
};

const gameInfoAtom = atom<GameInfo | null>(null);

export const useGameInfo = () => {
  return useAtom(gameInfoAtom);
};
