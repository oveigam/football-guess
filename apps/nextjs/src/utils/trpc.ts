import type { AppRouter } from "@fooguess/api";
import { transformer } from "@fooguess/api/transformer";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { createTRPCNext } from "@trpc/next";

function getEndingLink() {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: `http://${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
    });
  }

  const client = createWSClient({
    url: `${process.env.NEXT_PUBLIC_WS_PROTOCOL}://${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
  });
  return wsLink<AppRouter>({
    client,
  });
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [getEndingLink()],
      transformer,
    };
  },
  ssr: false,
});
