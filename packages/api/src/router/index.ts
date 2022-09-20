import { t } from "../trpc";
import { gameRouter } from "./game";
import { playerRouter } from "./player";

export const appRouter = t.router({
  player: playerRouter,
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
