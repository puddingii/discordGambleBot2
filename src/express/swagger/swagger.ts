/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import fs from 'fs';

const doc = {
	info: {
		version: '1.1.0',
		title: 'Discord Gamble Bot API',
		description: `HELLO :>
		Before testing many api, please execute '/auth/' post method`,
	},
	host: 'localhost:3300',
	schemes: ['http'],
};

const OUTER_FILE_NAME = path.resolve(__dirname, './swagger-api.json');
const ROUTE_PATH = path.resolve(__dirname, '../routes');
const routeFiles = fs
	.readdirSync(ROUTE_PATH)
	.filter(fileName => fileName.endsWith('index.js') || fileName.endsWith('index.ts'));

const endpointsFiles = [`${ROUTE_PATH}/${routeFiles[0]}`];

swaggerAutogen(OUTER_FILE_NAME, endpointsFiles, doc);
