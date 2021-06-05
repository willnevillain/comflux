import express from 'express';
import { handleGetWill } from './handlers';

const app = express();
const port = 3000;

app.get('/health', (_req, res) => {
    res.status(200).send('OK!');
});

app.get('/users/will', async (_req, res) => {
    const will = await handleGetWill();
    res.status(200).send(will);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
