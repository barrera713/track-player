// import type { IStorer } from '../storage/interfaces';
// import querystring from 'node:querystring';

export interface SpotifyAccessToken {
    accessToken: string;
    scope: string;
    expiresIn: number;
}

export class SpotifyCaller {
    private clientId: string;
    private clientSecret: string;
    private refreshToken: string;
    private accessToken: string;
    // private storer: IStorer;

    constructor() {
        this.clientId = process.env.CLIENT_ID || '';
        this.clientSecret = process.env.CLIENT_SECRET || '';
        this.refreshToken = process.env.REFRESH_TOKEN || '';
        this.accessToken = '';
        // this.storer = storer;
    }

    public async getAccessToken(): Promise<void> {
        const tempToken = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const headers = {
            Authorization: `Basic ${tempToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        }

        const params = new URLSearchParams()
        params.append('grant_type', 'refresh_token')
        params.append('refresh_token', this.refreshToken)

        const response: Response = await fetch(
            'https://accounts.spotify.com/api/token',
            { method: 'POST', headers, body: params }
        )

        const data = await response.json();
        this.accessToken = data.access_token;
    }

    public async getCurrentTune(): Promise<Response> {
        let response: Response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { 
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            }
        });

        const data = await response.json();
        return data;
    }
}