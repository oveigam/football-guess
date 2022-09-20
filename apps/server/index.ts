import { appRouter, createContext } from "@fooguess/api";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";
import { scheduleFootballDataScrape } from "./src/scheduler";

// http server
const { server, listen } = createHTTPServer({
  router: appRouter,
  createContext,
});

// ws server
const wss = new ws.Server({ server });
wss.on("connection", (ws) => {
  console.log(`++ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`-- Connection (${wss.clients.size})`);
  });
});
applyWSSHandler({ wss, router: appRouter, createContext });

// schdulers
scheduleFootballDataScrape();

// server start listening
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
listen(port);

console.log(`Server started on port ${port}`);
