import axios from 'axios';
import crypto from 'crypto';
import { Request } from 'express';
import { TwitchVerificationInfo } from '.';
import {
    NGROK_URL,
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_EVENTSUB_SECRET,
} from './config';

type TwitchAuthResponse = {
    access_token: string;
};

type TwitchCreateSubscriptionBody = {
    type: string;
    version: string;
    condition: {
        broadcaster_user_id: string;
    };
    transport: {
        method: string;
        callback: string;
        secret: string;
    };
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

const getTwitchAccessToken = async (): Promise<TwitchAuthResponse> => {
    const authResponse = await axios({
        url: 'https://id.twitch.tv/oauth2/token',
        method: 'POST',
        params: {
            client_id: TWITCH_CLIENT_ID,
            client_secret: TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials',
        },
    });

    return authResponse.data as TwitchAuthResponse;
};

export const verifyTwitchSignature = async ({
    messageId,
    messageSignature,
    messageTimestamp,
    rawRequestBody,
}: TwitchVerificationInfo): Promise<boolean> => {
    const message = `${messageId}${messageTimestamp}${rawRequestBody}`;
    const signature = crypto
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .createHmac('sha256', TWITCH_EVENTSUB_SECRET!)
        .update(message);
    const expected = `sha256=${signature.digest('hex')}`;
    console.log(messageSignature);
    console.log(expected);
    return expected === messageSignature;
};

export const handleChannelUpdateEvent = async (body: any): Promise<void> => {
    console.log(body.event);
};

export const handleDeleteEventSubscriptions = async (): Promise<void> => {
    const { access_token } = await getTwitchAccessToken();
    const { data: responseBody } = await axios({
        url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${access_token}`,
        },
    });

    const subscriptions = responseBody.data as { id: string }[];

    console.log(JSON.stringify(subscriptions));

    await Promise.all(
        subscriptions.map((subscription) =>
            axios({
                url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
                method: 'DELETE',
                params: {
                    id: subscription.id,
                },
                headers: {
                    'Client-ID': TWITCH_CLIENT_ID,
                    Authorization: `Bearer ${access_token}`,
                },
            })
        )
    );

    const { data: subscriptionsAfterDelete } = await axios({
        url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${access_token}`,
        },
    });
    console.log(JSON.stringify(subscriptionsAfterDelete));
};

export const handleCreateChannelUpdateSubscription =
    async (): Promise<void> => {
        const { access_token } = await getTwitchAccessToken();
        const body: TwitchCreateSubscriptionBody = {
            type: 'channel.update',
            version: '1',
            condition: {
                broadcaster_user_id: '682923024',
            },
            transport: {
                method: 'webhook',
                callback: `${NGROK_URL}/eventsub`,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                secret: TWITCH_EVENTSUB_SECRET!,
            },
        };
        await axios({
            url: 'https://api.twitch.tv/helix/eventsub/subscriptions',
            method: 'POST',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            data: body,
        });
    };

export const handleGetWill = async (): Promise<TwitchUserDetail> => {
    const { access_token } = await getTwitchAccessToken();

    const apiResponse = await axios({
        url: 'https://api.twitch.tv/helix/search/channels',
        params: {
            query: 'WillNevillain',
        },
        headers: {
            'client-id': TWITCH_CLIENT_ID,
            Authorization: `Bearer ${access_token}`,
        },
    });

    const usersDetail = apiResponse.data.data as TwitchUserDetail[];

    const [will] = usersDetail.filter(
        (userDetail) => userDetail.broadcaster_login === 'willnevillain'
    );

    return will;
};
