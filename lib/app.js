'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import router from './router';
import config from './config';

const app = express();

app.use(bodyParser.json());
app.use('/', router);

app.set('isRunning', false);
if (!module.parent) {
    app.listen(config.port, () => {
        console.log('Slack Cutter listening on:', config.port);
        app.set('isRunning', true);
    });
}

export default app;
