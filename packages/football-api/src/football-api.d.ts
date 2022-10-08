type Area = {
  id: number;
  name: string;
  code: string;
  flag: string;
};

type Season = {
  id: number;
  startDate: string;
  currentMatchday: number;
  winner: unknown;
};

type Competition = {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
};

type Team = {
  area: Area;
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  runningCompetitions: [Competition, ...Competition[]];
};

export type CompetitionsResponse = {
  count: number;
  filters: { client: string };
  competitions: Array<
    Competition & {
      area: Area;
      plan: string;
      currentSeason: Season;
    }
  >;
};

export type TeamsResponseLight = {
  teams: Array<Omit<Team, "area" | "runningCompetitions">>;
};

export type TeamsResponse = {
  count: number;
  filters: { season: string };
  competition: Competition;
  season: Season;
  teams: Array<
    Team & {
      coach: {
        id: number;
        firstName: string;
        lastName: string | null;
        name: string;
        dateOfBirth: string;
        nationality: string;
        contract: {
          start: string | null;
          until: string | null;
        };
      };
      squad: Array<{
        id: number;
        name: string;
        position: "Goalkeeper" | "Defence" | "Midfield" | "Offence" | "Midfielder" | "Forward" | "" | null;
        dateOfBirth: string;
        nationality: string?;
      }>;
      lastUpdated: string;
    }
  >;
};

export type ApiPlayerPosition =
  | "Left Winger"
  | "Goalkeeper"
  | "Centre-Forward"
  | "Centre-Back"
  | "Right-Back"
  | "Central Midfield"
  | "Right Winger"
  | "Attacking Midfield"
  | "Left-Back"
  | "Offence"
  | "Defensive Midfield"
  | "Right Midfield"
  | "Left Midfield"
  | "Midfield"
  | "Defence"
  | "Striker";

export type PersonResponse = {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  position: ApiPlayerPosition;
  shirtNumber: number;
  lastUpdated: string;
  currentTeam: Team & {
    contract: {
      start: string;
      end: string;
    };
  };
};
