declare module 'google-auth-library' {
  export class OAuth2Client {
    constructor(clientId: string, clientSecret: string, redirectUri: string);
    setCredentials(credentials: { refresh_token: string }): void;
    getAccessToken(): Promise<{ token: string | null | undefined }>;
  }
}