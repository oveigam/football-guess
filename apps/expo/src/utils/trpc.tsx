import type { AppRouter } from "@fooguess/api";
import { createWSClient, wsLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCReact<AppRouter>();

const ENVIRONMENT = process.env.ENVIRONMENT;

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
import Constants from "expo-constants";
const getBaseUrl = () => {
  if (ENVIRONMENT === "dev") {
    /**
     * Gets the IP address of your host-machine. If it cannot automatically find it,
     * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
     * you don't have anything else running on it, or you'd have to change it.
     */
    const localhost = Constants.manifest?.debuggerHost?.split(":")[0];
    if (!localhost) {
      // console.log("failed to get localhost, configure it manually");
      return `ws://192.168.1.21:4000/trpc`;
    }
    return `ws://${localhost}:4000/trpc`;
  } else {
    return `wss://football-guess-production.up.railway.app/trpc`;
  }
};

const wsClient = createWSClient({
  url: getBaseUrl(),
});

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
import { transformer } from "@fooguess/api/transformer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() => {
    return trpc.createClient({
      links: [wsLink({ client: wsClient })],
      transformer,
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
