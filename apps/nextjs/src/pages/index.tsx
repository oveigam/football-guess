import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import Button from "../components/common/Button";
import { useGameInfo } from "../hooks/useGameInfo";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const router = useRouter();

  const [_, setGameInfo] = useGameInfo();
  const [code, setCode] = useState("");

  const { mutate: createGame } = trpc.game.createGame.useMutation({
    onSuccess({ gameId, myId }) {
      setGameInfo({ gameId, myId });
      setCode("");
      router.push("game");
    },
  });

  const { mutate: joinLobby } = trpc.game.joinLobby.useMutation({
    onSuccess({ gameId, myId }) {
      setGameInfo({ gameId, myId });
      setCode("");
      router.push("game");
    },
  });

  return (
    <main className="bg-primary-50 mx-auto min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-16 p-4">
        <div className="text-center">
          <h1 className="text-primary-500 text-8xl font-semibold">Football</h1>
          <h1 className="text-primary-700 text-8xl font-bold">Guess</h1>
        </div>
        <div className="flex flex-col gap-4">
          <Button onClick={() => createGame()}>Create</Button>
          <div className="flex gap-4">
            <input
              className="border-primary-100 w-16 rounded-xl border bg-white px-2"
              maxLength={4}
              value={code}
              onChange={({ target }) => setCode(target.value.toLowerCase())}
            />
            <Button onClick={() => joinLobby({ code })}>Join</Button>
          </div>
        </div>
        <a
          className="w-1/3 "
          href="https://play.google.com/store/apps/details?id=com.oscarinadev.footballguess"
          target="_blank"
          rel="noreferrer"
        >
          <img draggable={false} className="hover:opacity-75 active:scale-95" src="/google-play-badge.png" />
        </a>
      </div>
    </main>
  );
};

export default Home;
