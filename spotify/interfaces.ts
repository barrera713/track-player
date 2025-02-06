export interface SpotifyAccessToken {
  accessToken: string;
  scope: string;
  expiresIn: number;
}

export interface ArtistInfo {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface TrackItemResponse {
  trackName: string;
  trackArtists: string;
}
