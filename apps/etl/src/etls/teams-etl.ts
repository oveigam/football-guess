import fs from "fs";
import { parse } from "csv-parse";
import { TeamData } from "../data/data";
import { prisma } from "@fooguess/db";
import footballApi from "@fooguess/football-api";
import { TeamsResponseLight } from "@fooguess/football-api/src/football-api";

export async function teamsEtl() {
  const [teams, competitions] = await Promise.all([footballApi.getTeams(), prisma.competition.findMany()]);

  const teamsMap = teams.reduce((map, t) => {
    map.set(t.id, t);
    return map;
  }, new Map<number, TeamsResponseLight["teams"][number]>());

  const competitionsIdMap = competitions.reduce((map, { id, fullName }) => {
    map.set(fullName, id);
    return map;
  }, new Map<string, number>());

  return new Promise((resolve, reject) => {
    fs.createReadStream("./src/data/teams_fifa23.csv")
      .pipe(parse({ delimiter: ",", from_line: 1, columns: true, cast: true }))
      .on("data", async (row: TeamData) => {
        const competitionName = row.League;
        const competitionId = competitionsIdMap.get(competitionName);
        if (!competitionId) {
          return;
        }
        const apiTeam = teamsMap.get(row.apiId);
        if (!apiTeam) {
          console.log("no API team for", row.Name);
          return;
        }
        await prisma.team.upsert({
          where: { id: row.ID },
          create: {
            id: row.ID,
            name: apiTeam.name,
            shortName: apiTeam.shortName,
            crest: apiTeam.crest,
            tla: apiTeam.crest,
            domesticPrestige: row.DomesticPrestige,
            intPrestige: row.IntPrestige,
            competitionId,
          },
          update: {
            name: apiTeam.name,
            shortName: apiTeam.shortName,
            crest: apiTeam.crest,
            tla: apiTeam.crest,
            domesticPrestige: row.DomesticPrestige,
            intPrestige: row.IntPrestige,
            competitionId,
          },
        });
      })
      .on("end", () => {
        console.log("finished teams etl");
        resolve(true);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
