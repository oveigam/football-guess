import type { AppRouter } from "@fooguess/api";
import { transformer } from "@fooguess/api/transformer";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { setupTRPC } from "@trpc/next";

function getEndingLink() {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: `http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
    });
  }

  const client = createWSClient({
    url: `ws://${process.env.NEXT_PUBLIC_SERVER_URL}`,
  });
  return wsLink<AppRouter>({
    client,
  });
}

export const trpc = setupTRPC<AppRouter>({
  config() {
    return {
      links: [getEndingLink()],
      transformer,
    };
  },
  ssr: false,
});
