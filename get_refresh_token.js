const { google } = require('googleapis');
const readline = require('readline');

const OAuth2 = google.auth.OAuth2;

// Replace these with your OAuth 2.0 credentials
const CLIENT_ID = '38620910984-m4u16iqdu6bqh5k67cpe8fjvpq4l2htt.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://mail.google.com/'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('Authorize this app by visiting this url:', url);

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Refresh token:', token.refresh_token);
  });
});