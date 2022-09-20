import type { AppRouter } from "@fooguess/api";
import { transformer } from "@fooguess/api/transformer";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { setupTRPC } from "@trpc/next";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 4000}`; // dev SSR should use localhost
};

function getEndingLink() {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: `http://localhost:4000/api/trpc`,
    });
  }
  const client = createWSClient({
    url: "ws://localhost:4000",
  });
  return wsLink<AppRouter>({
    client,
  });
}

export const trpc = setupTRPC<AppRouter>({
  config() {
    return {
      url: `${getBaseUrl()}/api/trpc`,
      links: [getEndingLink()],
      transformer,
    };
  },
  ssr: false,
});
