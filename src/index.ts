// import axios from 'axios';
import express from 'express';
// import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from './config';

// type TwitchAuthResponse = {
//     access_token: string;
// };

// type TwitchUserDetail = {
//     broadcaster_language: string;
//     broadcaster_login: string;
//     display_name: string;
//     game_id: string;
//     game_name: string;
//     id: string;
//     is_live: boolean;
//     tag_ids: string[];
//     thumbnail_url: string;
//     title: string;
//     started_at: string;
// };

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
    res.send('hi');
});

app.listen(port, () => {
    console.log('listening');
});

// (async () => {
//     const authResponse = await axios({
//         url: 'https://id.twitch.tv/oauth2/token',
//         method: 'POST',
//         params: {
//             client_id: TWITCH_CLIENT_ID,
//             client_secret: TWITCH_CLIENT_SECRET,
//             grant_type: 'client_credentials',
//         },
//     });

//     const authData = authResponse.data as TwitchAuthResponse;

//     const apiResponse = await axios({
//         url: 'https://api.twitch.tv/helix/search/channels',
//         params: {
//             query: 'WillNevillain',
//         },
//         headers: {
//             'client-id': TWITCH_CLIENT_ID,
//             Authorization: `Bearer ${authData.access_token}`,
//         },
//     });

//     const usersDetail = apiResponse.data.data as TwitchUserDetail[];

//     const me = usersDetail.filter(
//         (userDetail) => userDetail.broadcaster_login === 'willnevillain'
//     );

//     console.log(JSON.stringify(me));
// })();
