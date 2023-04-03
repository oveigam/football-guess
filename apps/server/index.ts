import ws from "@fastify/websocket";
import { appRouter, createContext } from "@fooguess/api";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { gameCleanUpScheluder } from "./src/scheduler";

import { config } from "dotenv";
config();

// fastify server
const server = fastify({
  maxParamLength: 5000,
});

// Registar websockets
server.register(ws);

// Register trpc adapter
server.register(fastifyTRPCPlugin, {
  useWSS: true,
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

// schdulers
gameCleanUpScheluder();

// server start listening
(async () => {
  try {
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await server.listen({ port, host: "0.0.0.0" });
    console.log(`Server started on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
