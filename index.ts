import { createLogger, format, transports } from 'winston';
import { SpotifyCaller } from './spotify/SpotifyCaller';

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [new transports.Console()],
});
const spotifyCaller = new SpotifyCaller();

const server = Bun.serve({
  port: 3000,
  async fetch() {
    await spotifyCaller.getAccessToken();
    const response = await spotifyCaller.getCurrentlyPlaying();
    return new Response(JSON.stringify({ data: response }));
  },
});

logger.info(`Listening on http://localhost:${server.port} ...`);
