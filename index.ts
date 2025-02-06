import { SpotifyCaller } from "./spotify/SpotifyCaller";
import type { IStorer } from "./storage/interfaces";

const spotifyCaller = new SpotifyCaller();

const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        await spotifyCaller.getAccessToken();
        const response = await spotifyCaller.getCurrentTune();
        return new Response(JSON.stringify({ data: response }));
    }
  });

console.log(`Listening on http://localhost:${server.port} ...`);