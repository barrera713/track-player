import type { ArtistInfo, TrackItemResponse } from './interfaces';

export class SpotifyCaller {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private accessToken: string;

  constructor() {
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.refreshToken = process.env.REFRESH_TOKEN || '';
    this.accessToken = '';
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

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  public async getCurrentlyPlaying(): Promise<TrackItemResponse> {
    const response: Response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();

    if (data === null) {
      return this.getRecentlyPlayed();
    }

    const trackName = data.item.name;
    const trackArtists = data.item.artists.map((artistInfo: ArtistInfo) => artistInfo.name).join(', ');
    const currentlyPlaying = { trackName, trackArtists };
    return currentlyPlaying;
  }

  private async getRecentlyPlayed(): Promise<TrackItemResponse> {
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const response: Response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { method: 'GET', headers });

    const data = await response.json();
    const trackName = data.items[0].track.name;
    const trackArtists = data.items[0].track.artists.map((artistInfo: ArtistInfo) => artistInfo.name).join(', ');
    const lastTrackPlayed = { trackName, trackArtists };
    return lastTrackPlayed;
  }
}
