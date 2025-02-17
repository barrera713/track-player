import { createLogger, format, transports } from 'winston';
import { SpotifyCaller } from './spotify/SpotifyCaller';
import { InMemoryStorage } from './storage/InMemoryStorage';

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [new transports.Console()],
});

const memoryCache = new InMemoryStorage();
const spotifyCaller = new SpotifyCaller(memoryCache);

const server = Bun.serve({
  port: 3000,
  async fetch(req: Request) {
    const path = new URL(req.url).pathname;
    if (path === '/spotify') {
      await spotifyCaller.getAccessToken();
      const response = await spotifyCaller.getCurrentlyPlayingOrLastPlayed();
      return new Response(JSON.stringify({ data: response }), { status: 200 });
    }

    return new Response(JSON.stringify({ data: 'Request unavailable' }), { status: 404 });
  },
});

logger.info(`Listening on http://localhost:${server.port} ...`);
