import { prisma } from "@fooguess/db";
import superjson from "superjson";
import { footballApi } from "./football-api/footbal-api";
import { convertPlayerPosition } from "./football-api/util/convertPlayerPosition";
import { PlayerPhotosTemp } from "@prisma/client";

export const scrapeFootballData = async () => {
  const { id: logId } = await prisma.scraperLog.create({ data: {} });
  console.log("[⚙️ SCRAPING] START!!!!");

  try {
    console.log("[⚙️ SCRAPING] Competitions 🏆🏆🏆");

    console.log("[🤏 FETCHING] Competitions 🏆🏆🏆");
    const competitions = await footballApi.getCompetitions();

    console.log("[💾 SAVING] Competitions 🏆🏆🏆");
    const competitionsIds = await Promise.all(
      competitions.map((c) => {
        const competitionUpsert = {
          id: c.id,
          name: c.name,
          code: c.code,
          emblem: c.emblem,
          area: {
            connectOrCreate: {
              where: { id: c.area.id },
              create: {
                id: c.area.id,
                name: c.area.name,
                code: c.area.code,
                flag: c.area.flag,
              },
            },
          },
        };
        return prisma.competition.upsert({
          where: { id: c.id },
          select: { id: true },
          create: competitionUpsert,
          update: competitionUpsert,
        });
      }),
    );

    console.log("[⚙️ SCRAPING] Teams ⚽⚽⚽");

    const playersIds: number[] = [];

    for (const { id: compId } of competitionsIds) {
      console.log(`[🤏 FETCHING] Teams ⚽⚽⚽ from competition ${compId} 🏆`);
      const teams = await footballApi.getTeamsByCompetition(compId);
      for (const team of teams) {
        playersIds.push(...team.squad.map(({ id }) => id));
        console.log(`[💾 SAVING] Team ${team.id} ⚽`);
        const teamUpsert = {
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          tla: team.tla,
          crest: team.crest,
          areaId: team.area.id,
          competitionId: compId,
        };
        await prisma.team.upsert({
          where: { id: team.id },
          create: teamUpsert,
          update: teamUpsert,
        });
      }
    }

    console.log("[⚙️ SCRAPING] Player Images 👕👕👕");
    console.log(`[🤏 FETCHING] Player Images 👕👕👕`);
    const wikiData = await footballApi.getPlayersImages();
    const playerImages: PlayerPhotosTemp[] = wikiData
      .filter(({ Forename, ImageURL }) => !ImageURL || !Forename)
      .map(({ ID, Forename, Surname, ImageURL }) => ({
        id: ID,
        name: Forename?.concat(" ").concat(Surname || "") || "",
        photo: ImageURL || null,
      }));

    console.log(`[💾 SAVING] Saving Player Images 👕👕👕`);
    await prisma.playerPhotosTemp.deleteMany({});
    await prisma.playerPhotosTemp.createMany({ data: playerImages });

    console.log("[⚙️ SCRAPING] Players 👕👕👕");

    let count = 0;
    for (const playerId of playersIds) {
      console.log(`[🤏 FETCHING] Player ${playerId} (${++count}/${playersIds.length}) 👕`);
      const player = await footballApi.getPlayer(playerId);

      if (!player.position || !player.nationality || !player.dateOfBirth || !player.shirtNumber) {
        console.log(`[🤷‍♂️ IGNORING] Insuficient data for player ${playerId} 👕`, player);
        continue;
      }

      const team = await prisma.team.findUnique({
        where: { id: player.currentTeam.id },
      });
      if (!team) {
        console.log(`[🤷‍♂️ IGNORING] No team ${player.currentTeam.id} found for player ${playerId} 👕`, player);
        continue;
      }

      console.log(`[💾 SAVING] Player ${playerId} 👕`);
      const playerUpsert = {
        id: player.id,
        name: player.name,
        position: convertPlayerPosition(player.position),
        birth: player.dateOfBirth,
        nationality: player.nationality,
        shirtNumber: player.shirtNumber,
        teamId: player.currentTeam.id,
      };
      await prisma.player.upsert({
        where: { id: player.id },
        create: playerUpsert,
        update: playerUpsert,
      });
    }

    await prisma.scraperLog.update({ where: { id: logId }, data: { end: new Date() } });

    console.log("[⚙️ SCRAPING] END!!!!");

    return true;
  } catch (error) {
    console.error(error);
    const { json } = superjson.serialize(error);
    await prisma.scraperLog.update({
      where: { id: logId },
      data: { end: new Date(), isError: true, error: json as any },
    });
    return false;
  }
};
