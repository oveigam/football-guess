import { GamePlayer, PrismaClient } from "@prisma/client";
import { observable } from "@trpc/server/observable";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { ee } from "../event-emitter";
import { t } from "../trpc";
import { GameGuess, Player, Team, Competition, GameStatus } from "@prisma/client";

const nanoid = customAlphabet("1234567890abcdefghyjklmnopqrstuvwxyz", 4);

const adjectives = ["hooligan", "ultra", "affiliate", "fan"];

function randomElement<T>(arr: T[]) {
  const el = arr[Math.floor(Math.random() * arr.length)];
  if (!el) {
    throw new Error("unexpected error");
  }
  return el;
}

async function generatePlayerName(prisma: PrismaClient) {
  const teams = await prisma.team.findMany({ select: { shortName: true } });
  const { shortName } = randomElement(teams);
  const adj = randomElement(adjectives);
  return `${shortName} ${adj}`;
}

type GuessEventData = (GameGuess & {
  guess: Player & {
    team: Team & {
      competition: Competition;
    };
  };
  gamePlayer: GamePlayer;
})[];

export const gameRouter = t.router({
  getGame: t.procedure.input(z.object({ id: z.number() })).query(({ ctx, input }) => {
    return ctx.prisma.game.findUnique({
      where: { id: input.id },
      include: {
        gamePlayers: true,
        guesses: {
          include: {
            guess: {
              include: {
                team: {
                  include: { competition: true },
                },
              },
            },
            gamePlayer: true,
          },
        },
        solution: {
          include: { team: true },
        },
      },
    });
  }),
  createGame: t.procedure.mutation(async ({ ctx }) => {
    let code: string | null = null;
    while (!code) {
      code = nanoid();
      const gameWithDupCode = await ctx.prisma.game.findUnique({ where: { code } });
      if (gameWithDupCode) {
        code = null;
      }
    }

    const players = await ctx.prisma.player.findMany({ select: { id: true } });
    const solution = randomElement(players);

    const name = await generatePlayerName(ctx.prisma);

    const { id, game } = await ctx.prisma.gamePlayer.create({
      select: {
        id: true,
        game: {
          select: { id: true },
        },
      },
      data: {
        name,
        game: {
          create: {
            code,
            solution: { connect: { id: solution.id } },
          },
        },
      },
    });

    return { gameId: game.id, myId: id };
  }),
  joinLobby: t.procedure.input(z.object({ code: z.string() })).mutation(async ({ ctx, input: { code } }) => {
    const existingGame = await ctx.prisma.game.findUnique({ where: { code } });
    if (!existingGame) {
      throw new Error("Game not found");
    }
    if (existingGame.status !== "Lobby") {
      throw new Error("Game not a lobby");
    }

    const name = await generatePlayerName(ctx.prisma);

    const { game, ...gamePlayer } = await ctx.prisma.gamePlayer.create({
      include: {
        game: {
          select: { id: true, code: true },
        },
      },
      data: {
        name,
        game: {
          connect: {
            id: existingGame.id,
          },
        },
      },
    });

    ee.emit("newPlayer", { gameCode: game.code, gamePlayer });

    return { gameId: game.id, myId: gamePlayer.id };
  }),
  newPlayer: t.procedure.input(z.object({ code: z.string() })).subscription(({ ctx, input: { code } }) => {
    return observable<GamePlayer>((emit) => {
      const newPlayer = (data: { gameCode: string; gamePlayer: GamePlayer }) => {
        if (code === data.gameCode) {
          emit.next(data.gamePlayer);
        }
      };
      ee.on("newPlayer", newPlayer);
      return () => {
        ee.off("newPlayer", newPlayer);
      };
    });
  }),
  leaveGame: t.procedure.input(z.object({ gamePlayerId: z.number() })).mutation(async ({ ctx, input }) => {
    const deleted = await ctx.prisma.gamePlayer.delete({
      where: { id: input.gamePlayerId },
      select: { id: true, gameId: true },
    });
    if (deleted) {
      ee.emit("playerLeft", { gamePlayerId: deleted.id, gameId: deleted.gameId });
    }
  }),
  playerLeft: t.procedure.input(z.object({ gameId: z.number() })).subscription(({ ctx, input: { gameId } }) => {
    return observable<{ gamePlayerId: number }>((emit) => {
      const playerLeft = (data: { gameId: number; gamePlayerId: number }) => {
        if (gameId === data.gameId) {
          emit.next({ gamePlayerId: data.gamePlayerId });
        }
      };
      ee.on("playerLeft", playerLeft);
      return () => {
        ee.off("playerLeft", playerLeft);
      };
    });
  }),
  startGame: t.procedure.input(z.object({ gameId: z.number() })).mutation(async ({ ctx, input }) => {
    const game = await ctx.prisma.game.findUnique({
      where: { id: input.gameId },
      include: { solution: { include: { team: true } } },
    });

    if (!game) throw new Error("Game not found");

    const players = await ctx.prisma.player.findMany({ include: { team: true } });
    const solution = randomElement(players);

    const possibleFirstGuesses = await ctx.prisma.player.findMany({
      select: { id: true },
      where: {
        team: {
          id: { not: solution.teamId },
          competitionId: { not: solution.team.competitionId },
        },
        position: { not: solution.position },
        nationality: { not: solution.nationality },
        shirtNumber: { not: solution.shirtNumber },
        birth: { not: solution.birth }, //FIXME convert yo years
      },
    });
    await ctx.prisma.gameGuess.deleteMany({
      where: { gameId: input.gameId },
    });
    const firstGuess = randomElement(possibleFirstGuesses);
    const response = await ctx.prisma.game.update({
      where: { id: input.gameId },
      data: {
        status: "Playing",
        solutionId: solution.id,
        guesses: {
          create: {
            guessId: firstGuess.id,
          },
        },
      },
    });

    ee.emit("gameStarted", { gameId: input.gameId });

    return response;
  }),
  gameStarted: t.procedure.input(z.object({ gameId: z.number() })).subscription(({ ctx, input: { gameId } }) => {
    return observable<void>((emit) => {
      const gameStarted = (data: { gameId: number }) => {
        if (gameId === data.gameId) {
          emit.next();
        }
      };
      ee.on("gameStarted", gameStarted);
      return () => {
        ee.off("gameStarted", gameStarted);
      };
    });
  }),
  makeAGuess: t.procedure
    .input(z.object({ playerId: z.number(), gameId: z.number(), myId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(async () => {
        const dbGame = await ctx.prisma.game.findUnique({
          select: { status: true },
          where: { id: input.gameId },
        });

        if (!dbGame) {
          throw new Error("Game not found");
        }

        if (dbGame.status === "Playing") {
          const game = await ctx.prisma.game.update({
            include: {
              guesses: {
                include: {
                  guess: {
                    include: {
                      team: {
                        include: { competition: true },
                      },
                    },
                  },
                  gamePlayer: true,
                },
              },
            },
            where: { id: input.gameId },
            data: {
              guesses: {
                create: {
                  gamePlayerId: input.myId,
                  guessId: input.playerId,
                },
              },
            },
          });

          if (game.solutionId === input.playerId) {
            await ctx.prisma.game.update({
              where: { id: input.gameId },
              data: { status: "Ended" },
            });
            game.status = "Ended";
          }

          ee.emit("guessMade", { gameId: game.id, status: game.status, guesses: game.guesses });
        } else {
          throw new Error("Game ended!");
        }
      });
    }),
  guessMade: t.procedure.input(z.object({ gameId: z.number() })).subscription(({ input }) => {
    return observable<{ gameId: number; status: GameStatus; guesses: GuessEventData }>((emit) => {
      const guessMade = (data: { gameId: number; status: GameStatus; guesses: GuessEventData }) => {
        if (input.gameId === data.gameId) {
          emit.next(data);
        }
      };
      ee.on("guessMade", guessMade);
      return () => {
        ee.off("guessMade", guessMade);
      };
    });
  }),
});
