export interface SpotifyAccessToken {
  access_token: string;
  expires_in: number;
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