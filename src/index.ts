import { json as bodyParserJson } from 'body-parser';
import express, { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import {
    handleChannelUpdateEvent,
    handleCreateChannelUpdateSubscription,
    handleDeleteEventSubscriptions,
    handleGetWill,
    verifyTwitchSignature,
} from './handlers';

const app = express();

app.use(
    bodyParserJson({
        verify: (req: IncomingMessage & { rawBody?: Buffer }, _res, buf) => {
            req.rawBody = buf;
        },
    })
);

const port = 3000;

app.get('/health', (_req, res) => {
    res.status(200).send('OK!');
});

app.get('/users/will', async (_req, res) => {
    const will = await handleGetWill();
    res.status(200).send(will);
});

app.post('/eventsub/createChannelUpdateSubscription', async (_req, res) => {
    await handleCreateChannelUpdateSubscription();
    res.status(200).send({});
});

const isCallbackVerificationRequest = (req: Request): boolean =>
    req.header('twitch-eventsub-message-type') ===
    'webhook_callback_verification';

export type TwitchVerificationInfo = {
    messageId: string;
    messageSignature: string;
    messageTimestamp: string;
    rawRequestBody: Buffer;
};

const extractVerificationInfo = (req: Request): TwitchVerificationInfo => {
    const messageId = req.header('twitch-eventsub-message-id');
    const messageSignature = req.header('twitch-eventsub-message-signature');

    const messageTimestamp = req.header('twitch-eventsub-message-timestamp');
    if (!messageId || !messageSignature || !messageTimestamp) {
        throw new Error('Missing required headers - was the call from Twitch?');
    }
    const rawRequestBody = Buffer.from(JSON.stringify(req.body));
    return { messageId, messageSignature, messageTimestamp, rawRequestBody };
};

app.post('/eventsub', async (req: Request, res: Response) => {
    if (isCallbackVerificationRequest(req)) {
        const verificationInfo = extractVerificationInfo(req);
        const isValid = verifyTwitchSignature(verificationInfo);
        if (!isValid) {
            res.status(403).send({ error: 'Invalid signature' });
        }
        res.status(200).send(req.body.challenge);
    } else {
        await handleChannelUpdateEvent(req.body);
        res.status(200).send({});
    }
});

app.delete('/eventsub', async (_req: Request, res: Response) => {
    await handleDeleteEventSubscriptions();
    res.status(204).send({});
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
