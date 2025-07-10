import {readFile} from 'fs/promises';
import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import Express from 'express';
import { ruruHTML } from 'ruru/server';
import dotenv from 'dotenv';
import path from "node:path";

dotenv.config();

const schema = buildSchema(await readFile(path.join(import.meta.dirname, '../res/schema.graphqls'), "utf-8"));

const app = Express();

app.all(
    '/api',
    createHandler({
        schema: schema,
    }),
);

app.get('/', (_req, res) => {
    res.type('html');
    res.end(ruruHTML({ endpoint: '/api' }));
});

app.listen(4000);