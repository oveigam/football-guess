import { Position } from ".prisma/client";
import { prisma } from "@fooguess/db";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghyjklmnopqrstuvwxyz", 4);

function randomElement<T>(arr: T[]) {
  const el = arr[Math.floor(Math.random() * arr.length)];
  if (!el) {
    throw new Error("unexpected error");
  }
  return el;
}

const nameAdjectives = ["hooligan", "ultra", "fan"];

async function generateUserName() {
  const teams = await prisma.team.findMany({ select: { shortName: true }, where: { intPrestige: { gt: 9 } } });
  const { shortName } = randomElement(teams);
  const adj = randomElement(nameAdjectives);
  return `${shortName} ${adj}`;
}

async function createUser(game: Game) {
  const lastId = game.users[game.users.length - 1]?.id || 0;
  return {
    id: lastId + 1,
    name: await generateUserName(),
    lives: game.config.lives,
    points: 0,
    totalPoints: 0,
  };
}

export type GameStatus = "Lobby" | "Playing" | "Ended";
export type User = { id: number; name: string; lives: number; points: number; totalPoints: number };
export type Guess = {
  id: number;
  name: string;
  photo: string;
  nationality: string;
  competition: {
    id: number;
    name: string;
    emblem: string;
  };
  team: {
    id: number;
    name: string;
    crest: string;
  };
  position: Position;
  age: number;
  shirtNumber: number;
  userId?: number;
};

class Guesses {
  private static cache = new Map<number, Guess>();

  private constructor() {}

  static cacheIsReady() {
    return this.cache.size > 0;
  }

  static async initCache() {
    const players = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        photo: true,
        nationality: true,
        position: true,
        age: true,
        shirtNumber: true,
        team: {
          select: {
            id: true,
            shortName: true,
            crest: true,
            competition: { select: { id: true, name: true, emblem: true } },
          },
        },
      },
    });
    this.cache.clear();
    for (const p of players) {
      this.cache.set(p.id, {
        id: p.id,
        name: p.name,
        photo: p.photo,
        nationality: p.nationality,
        competition: {
          id: p.team.competition.id,
          name: p.team.competition.name,
          emblem: p.team.competition.emblem,
        },
        team: {
          id: p.team.id,
          name: p.team.shortName,
          crest: p.team.crest,
        },
        position: p.position,
        age: p.age,
        shirtNumber: p.shirtNumber,
      });
    }
  }

  static get(playerId: number) {
    const guess = this.cache.get(playerId);
    if (!guess) {
      throw new Error("No guess on cache");
    }
    return guess;
  }
}

export class Game {
  lastActivity;
  code;
  status: GameStatus;
  solution;
  users: User[] = [];
  guesses: Guess[] = [];

  config: { lives: number; competitions: number[]; minPrestige: number };

  points: {
    id?: number;
    nationality?: number;
    competitionId?: number;
    teamId?: number;
    position?: number;
    age?: number;
    shirtNumber?: number;
  };

  constructor(code: string, solution: Guess) {
    this.lastActivity = Date.now();
    this.code = code;
    this.status = "Lobby";
    this.solution = solution;
    this.config = {
      lives: 5,
      competitions: [1, 3, 4, 6, 7],
      minPrestige: 80,
    };
    this.points = {};
  }
}

export class GameFactory {
  private static games = new Map<string, Game>();

  private constructor() {}

  static getGame(code: string) {
    const game = this.games.get(code);
    if (!game) {
      throw new Error("Game not found");
    }
    game.lastActivity = Date.now();
    return game;
  }

  static async generateSolution() {
    const players = await prisma.player.findMany({
      select: { id: true },
      where: {
        team: {
          // TODO Regular la dificultad manualmente
          competitionId: { notIn: [2, 5] }, // Quitar liga holandesa y portuguesa
          intPrestige: { gt: 8 },
        },
      },
    });
    const { id } = randomElement(players);
    return Guesses.get(id);
  }

  static async create() {
    if (!Guesses.cacheIsReady()) {
      // El primero en crear que levante la cache
      await Guesses.initCache();
    }
    let code;
    while (!code) {
      code = nanoid();
      if (this.games.get(code)) {
        code = null;
      }
    }
    const game = new Game(code, await this.generateSolution());
    const user = await createUser(game);
    game.users.push(user);
    this.games.set(code, game);
    return { game, user };
  }

  static async join(code: string) {
    const game = this.getGame(code);
    const user = await createUser(game);
    game.users.push(user);
    return { game, user };
  }

  static leave(code: string, userId: number) {
    const game = this.getGame(code);
    game.users = game.users.filter(({ id }) => id !== userId);
    game.lastActivity = Date.now();
    return game;
  }

  static async start(code: string) {
    const game = this.getGame(code);

    game.points = {};
    game.solution = await this.generateSolution();
    const possibleFirstGuesses = await prisma.player.findMany({
      select: { id: true },
      where: {
        team: {
          id: { not: game.solution.team.id },
          competitionId: { in: game.config.competitions, not: game.solution.competition.id },
        },
        position: { not: game.solution.position },
        nationality: { not: game.solution.nationality },
        shirtNumber: { not: game.solution.shirtNumber },
        age: { not: game.solution.age },
      },
    });

    const { id } = randomElement(possibleFirstGuesses);
    const firstGuess = Guesses.get(id);

    game.guesses = [];
    game.guesses.push(firstGuess);
    for (const user of game.users) {
      user.lives = game.config.lives;
    }
    game.status = "Playing";
    game.lastActivity = Date.now();
    return game;
  }

  static makeAGuess(args: { code: string; playerId: number; userId: number }) {
    const { code, playerId, userId } = args;
    const game = this.getGame(code);
    const solution = game.solution;
    const points = game.points;
    const guess = Guesses.get(playerId);

    const me = game.users.find(({ id }) => userId === id);
    if (!userId || !me) {
      throw Error("No guesser!");
    }
    if (!me.lives) {
      throw Error("No lives!");
    }

    const { id, nationality, competition, team, position, age, shirtNumber } = guess;
    const competitionId = competition.id;
    const teamId = team.id;

    game.guesses.push({ ...guess, userId });

    let gameEnded = false;
    let takeLife = true;

    if (!points.nationality && nationality === solution.nationality) {
      points.nationality = userId;
      takeLife = false;
    }

    if (!points.competitionId && competitionId === solution.competition.id) {
      points.competitionId = userId;
      takeLife = false;
    }

    if (!points.teamId && teamId === solution.team.id) {
      points.teamId = userId;
      takeLife = false;
    }

    if (!points.position && position === solution.position) {
      points.position = userId;
      takeLife = false;
    }

    if (!points.age && age === solution.age) {
      points.age = userId;
      takeLife = false;
    }

    if (!points.shirtNumber && shirtNumber === solution.shirtNumber) {
      points.shirtNumber = userId;
      takeLife = false;
    }

    if (!points.id && id === solution.id) {
      points.id = userId;
      takeLife = false;
      gameEnded = true;
    }

    if (takeLife) {
      me.lives--;
    }

    const noPlayerAlive = !game.users.some(({ lives }) => lives > 0);
    if (!gameEnded && noPlayerAlive) {
      gameEnded = true;
    }

    if (gameEnded) {
      const pointsDistribution = new Map<number, number>();
      for (const [field, guesserId] of Object.entries(points)) {
        const guesserPoints = pointsDistribution.get(guesserId) || 0;
        const award = field === "id" ? 2 : 1;
        pointsDistribution.set(guesserId, guesserPoints + award);
      }

      for (const user of game.users) {
        const ptsThisGame = pointsDistribution.get(user.id) || 0;
        user.points = ptsThisGame;
        user.totalPoints = user.totalPoints + ptsThisGame;
      }

      game.users = game.users.sort((a, b) => {
        const currentOrder = b.points - a.points;
        if (currentOrder === 0) {
          return b.totalPoints - a.totalPoints;
        } else {
          return currentOrder;
        }
      });

      game.status = "Ended";
    }

    game.lastActivity = Date.now();
    return game;
  }

  static gameCleanUp() {
    for (const [code, game] of Array.from(this.games)) {
      const minutesSinceActive = (Date.now() - game.lastActivity) / 60000;
      if (minutesSinceActive > 10) {
        this.games.delete(code);
      }
    }
  }
}
