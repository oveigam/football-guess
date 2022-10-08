import { Position } from ".prisma/client";
import { prisma } from "@fooguess/db";
import { parse } from "csv-parse";
import fs from "fs";
import { PlayerData, PositionData } from "../data/data";
import stringSimilarity from "string-similarity";

function getPosition(dataPosition: PositionData) {
  switch (dataPosition) {
    case "GK":
      return Position.Goalkeeper;

    case "CB":
    case "RB":
    case "LB":
    case "RWB":
    case "LWB":
      return Position.Defence;

    case "CM":
    case "CDM":
    case "CAM":
    case "RM":
    case "LM":
      return Position.Midfield;

    case "ST":
    case "CF":
    case "RF":
    case "LF":
    case "RW":
    case "LW":
      return Position.Offence;
  }
}

function getBestTeamMatch(teamName: string, teams: { id: number; name: string }[]) {
  if (!teams.length) {
    return;
  }
  let bestSimil = -1;
  let id: number | undefined;
  for (const team of teams) {
    const simil = stringSimilarity.compareTwoStrings(teamName, team.name);
    if (simil === 1) {
      return team.id;
    } else if (simil > bestSimil) {
      bestSimil = simil;
      id = team.id;
    }
  }
  if (id) {
    // console.log("shitty simil", teamName, bestSimil);
    return id;
  }
}

export async function playersEtl() {
  return new Promise((resolve, reject) => {
    fs.createReadStream("./src/data/players_fifa23.csv")
      .pipe(parse({ delimiter: ",", from_line: 1, columns: true, cast: true }))
      .on("data", async (row: PlayerData) => {
        const teams = await prisma.team.findMany({
          select: { id: true, name: true },
          where: { name: { contains: row.Club } },
        });
        const teamId = getBestTeamMatch(row.Club, teams);
        if (!teamId) {
          return;
        }
        const mierda = await prisma.player.upsert({
          where: { id: row.ID },
          create: {
            id: row.ID,
            name: row.Name,
            teamId: teamId,
            photo: row.PhotoUrl,
            shirtNumber: row.ClubNumber,
            position: getPosition(row.BestPosition),
            age: row.Age,
            nationality: row.Nationality,
            height: row.Height,
            rating: row.Overall,
          },
          update: {
            name: row.Name,
            teamId: teamId,
            photo: row.PhotoUrl,
            shirtNumber: row.ClubNumber,
            position: getPosition(row.BestPosition),
            age: row.Age,
            nationality: row.Nationality,
            height: row.Height,
            rating: row.Overall,
          },
        });
      })
      .on("end", () => {
        console.log("finished players etl");
        resolve(true);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
