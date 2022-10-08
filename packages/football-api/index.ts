import axios from "axios";
import * as dotenv from "dotenv";
import { CompetitionsResponse, PersonResponse, TeamsResponse, TeamsResponseLight } from "./src/football-api";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// --- Ligas soportadas ---
// BL1  Bundesliga (Alemania)
// DED  Eredivisie (Paises Bajos)
// PD   Primera Division (Españita)
// FL1  Ligue 1 (Francia)
// PPL  Primeira Liga (Portugal)
// SA   Serie A (Italia)
// PL   Premier League (Inglaterra)
const SUPPORTED_COMPETITIONS = ["BL1", "DED", "PD", "FL1", "PPL", "SA", "PL"];

/**
 * La api tiene una limitacion de 10 llamadas por minuto en el free tier T_T
 * Esto se traduce a que puedo hacer una llamada cada 6s
 * Se añade un segundo extra al tiempo de espera por ser precavidos
 */
const THROTTLE = 7000;

class ApiClient {
  client;
  lastCall: number | undefined;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: process.env.FOOTBALL_DATA_API_URL,
      headers: {
        "X-Auth-Token": apiKey,
      },
    });
  }

  needsToThrottle() {
    if (this.lastCall) {
      const elapsedSinceLast = Date.now() - this.lastCall;
      // Si no ha pasado el tiempo de espera desde la ultima llamada esperamos el tiempo necesario
      if (elapsedSinceLast < THROTTLE) {
        return THROTTLE - elapsedSinceLast;
      }
    }
    return 0;
  }

  async throttleCall<T>(call: () => T) {
    const waitTime = this.needsToThrottle();
    if (waitTime) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    const response = await call();
    this.lastCall = Date.now();
    return response;
  }

  async getCompetitions() {
    const { data } = await this.throttleCall(() => this.client.get<CompetitionsResponse>("competitions"));
    return data.competitions.filter(({ code }) => SUPPORTED_COMPETITIONS.includes(code));
  }

  async getTeamsByCompetition(competitionId: number) {
    const { data } = await this.throttleCall(() =>
      this.client.get<TeamsResponse>(`competitions/${competitionId}/teams`),
    );
    return data.teams;
  }

  async getPlayer(playerId: number) {
    const { data } = await this.throttleCall(() => this.client.get<PersonResponse>(`persons/${playerId}`));
    return data;
  }
}

const apiClient1 = new ApiClient(process.env.FOOTBALL_DATA_API_KEY_1 as string);
const apiClient2 = new ApiClient(process.env.FOOTBALL_DATA_API_KEY_2 as string);
const apiClient3 = new ApiClient(process.env.FOOTBALL_DATA_API_KEY_3 as string);

function getApiClient() {
  if (!apiClient1.needsToThrottle()) {
    return apiClient1;
  } else if (!apiClient2.needsToThrottle()) {
    return apiClient2;
  } else if (!apiClient3.needsToThrottle()) {
    return apiClient3;
  } else {
    return apiClient1;
  }
}

export default {
  getCompetitions() {
    const client = getApiClient();
    return client.getCompetitions();
  },

  async getTeams() {
    const client = getApiClient();
    const competitions = await client.getCompetitions();

    const teams = await Promise.all(
      competitions.map(async ({ id, name }) => {
        const comptTeams = await client.getTeamsByCompetition(id);
        return comptTeams.map((t) => ({ ...t, leagueName: name }));
      }),
    );
    return teams.flat();
  },

  getTeamsByCompetition(competitionId: number) {
    const client = getApiClient();
    return client.getTeamsByCompetition(competitionId);
  },

  getPlayer(playerId: number) {
    const client = getApiClient();
    return client.getPlayer(playerId);
  },
};
