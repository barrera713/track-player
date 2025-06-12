import type { IStorer } from '../storage/interfaces';
import type { ArtistInfo, SpotifyAccessToken } from './interfaces';

const ACCESS_TOKEN = 'spotify-access-token';
const CURRENT_TRACK_PLAYING = 'current-track';
const LAST_PLAYED_TRACK = 'last-played-track';

export class SpotifyCaller {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private memoryStorage: IStorer;

  constructor(storer: IStorer) {
    this.clientId = process.env.CLIENT_ID!;
    this.clientSecret = process.env.CLIENT_SECRET!;
    this.refreshToken = process.env.REFRESH_TOKEN!;
    this.memoryStorage = storer;
  }

  public async getAccessToken(): Promise<void> {
    const tempToken = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const headers = {
      Authorization: `Basic ${tempToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', this.refreshToken);

    const response: Response = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers, body: params });

    const data = (await response.json()) as SpotifyAccessToken;
    this.memoryStorage.set(ACCESS_TOKEN, data.access_token, data.expires_in - 1000); // give it some grace for getting a new one
  }

  public async getCurrentlyPlayingOrLastPlayed(): Promise<string> {
    const currentlyPlayingFromCache = this.memoryStorage.get<string>(CURRENT_TRACK_PLAYING); 
    if (currentlyPlayingFromCache) return currentlyPlayingFromCache;

    let accessToken = this.memoryStorage.get<SpotifyAccessToken>(ACCESS_TOKEN);

    let response: Response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      await this.getAccessToken();
      accessToken = this.memoryStorage.get<SpotifyAccessToken>(ACCESS_TOKEN);
      response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    const data = await response.json();

    if (!data) {
      return this.getLastPlayed();
    }

    const trackName = data.item.name;
    const trackArtists = data.item.artists.map((artistInfo: ArtistInfo) => artistInfo.name).join(', ');
    const trackDuration = data.item.duration_ms;
    const currentlyPlaying = `Currently enjoying: ${trackName} ${trackArtists}`;
    this.memoryStorage.set(CURRENT_TRACK_PLAYING, currentlyPlaying, trackDuration);

    return currentlyPlaying;
  }

  private async getLastPlayed(): Promise<string> {
    const lastPlayedFromCache = this.memoryStorage.get<string>(LAST_PLAYED_TRACK);
    if (lastPlayedFromCache) return lastPlayedFromCache;

    const accessToken = this.memoryStorage.get(ACCESS_TOKEN);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const response: Response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { method: 'GET', headers });

    const data = await response.json();
    const trackName = data.items[0].track.name;
    const trackArtists = data.items[0].track.artists.map((artistInfo: ArtistInfo) => artistInfo.name).join(', ');
    const lastTrackPlayed = `Last played: ${trackName} ${trackArtists}`;
    this.memoryStorage.set(CURRENT_TRACK_PLAYING, lastTrackPlayed, 3500);

    return lastTrackPlayed;
  }
}
