import { Position } from ".prisma/client";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { ee } from "../event-emitter";
import { Game, GameFactory, GameStatus, Guess, User } from "../game/Game";
import { t } from "../trpc";

export const gameRouter = t.router({
  getGame: t.procedure.input(z.object({ code: z.string() })).query(({ input }) => {
    return GameFactory.getGame(input.code);
  }),
  createGame: t.procedure.mutation(async () => {
    const { game, user } = await GameFactory.create();
    return { code: game.code, myId: user.id };
  }),
  joinLobby: t.procedure.input(z.object({ code: z.string() })).mutation(async ({ input }) => {
    const { game, user } = await GameFactory.join(input.code);

    ee.emit("game", game);

    return { code: game.code, myId: user.id };
  }),
  leaveGame: t.procedure.input(z.object({ code: z.string(), userId: z.number() })).mutation(async ({ ctx, input }) => {
    const game = GameFactory.leave(input.code, input.userId);
    ee.emit("game", game);
  }),
  startGame: t.procedure.input(z.object({ code: z.string() })).mutation(async ({ ctx, input }) => {
    const game = await GameFactory.start(input.code);

    ee.emit("game", game);

    return game;
  }),
  makeAGuess: t.procedure
    .input(
      z.object({
        code: z.string(),
        userId: z.number(),
        playerId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      Position;
      return ctx.prisma.$transaction(async () => {
        const { code, userId, playerId } = input;
        const game = GameFactory.makeAGuess({ code, playerId, userId });

        ee.emit("game", game);
      });
    }),
  game: t.procedure.input(z.object({ code: z.string() })).subscription(({ input }) => {
    return observable<Game>((emit) => {
      const guessMade = (data: Game) => {
        if (input.code === data.code) {
          emit.next(data);
        }
      };
      ee.on("game", guessMade);
      return () => {
        ee.off("game", guessMade);
      };
    });
  }),
});
