import { prisma } from "@fooguess/db";
import cron from "node-cron";
import { scrapeFootballData } from "./scraper";

export const scheduleFootballDataScrape = async () => {
  // Cron job a las 6 de la mañana
  cron.schedule("0 6 * * *", async () => {
    const ongoingScrape = await prisma.scraperLog.findFirst({
      where: { end: null },
    });
    if (!ongoingScrape) {
      await scrapeFootballData();
    }
  });
};
