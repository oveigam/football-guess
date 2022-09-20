import { z } from "zod";
import { t } from "../trpc";

export const playerRouter = t.router({
  allSimple: t.procedure.query(({ ctx }) => {
    return ctx.prisma.player.findMany({ select: { id: true, name: true } });
  }),
  searchPlayer: t.procedure.input(z.object({ search: z.string() })).query(({ ctx, input }) => {
    if (input.search.length < 3) {
      return [];
    }
    return ctx.prisma.player.findMany({
      select: { id: true, name: true, photo: true },
      where: { name: { contains: input.search } },
    });
  }),
});
