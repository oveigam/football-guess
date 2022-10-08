import { GameFactory } from "@fooguess/api/src/game/Game";
import cron from "node-cron";

export const gameCleanUpScheluder = async () => {
  // Cron job cada 10 minutes
  cron.schedule("*/10 * * * *", () => {
    GameFactory.gameCleanUp();
  });
};
