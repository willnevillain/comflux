import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

const REPO_ROOT = path.join(__dirname, '../');
const DOT_ENV = path.join(REPO_ROOT, '.env');

dotenv.config({ path: DOT_ENV });

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

type TwitchAuthResponse = {
    access_token: string;
};

type TwitchUserDetail = {
    broadcaster_language: string;
    broadcaster_login: string;
    display_name: string;
    game_id: string;
    game_name: string;
    id: string;
    is_live: boolean;
    tag_ids: string[];
    thumbnail_url: string;
    title: string;
    started_at: string;
};

(async () => {
    const authResponse = await axios({
        url: 'https://id.twitch.tv/oauth2/token',
        method: 'POST',
        params: {
            client_id: TWITCH_CLIENT_ID,
            client_secret: TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials',
        },
    });

    const authData = authResponse.data as TwitchAuthResponse;

    const apiResponse = await axios({
        url: 'https://api.twitch.tv/helix/search/channels',
        params: {
            query: 'WillNevillain',
        },
        headers: {
            'client-id': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${authData.access_token}`,
        },
    });

    const usersDetail = apiResponse.data.data as TwitchUserDetail[];

    const me = usersDetail.filter(
        (userDetail) => userDetail.broadcaster_login === 'willnevillain'
    );

    console.log(JSON.stringify(me));
})();
