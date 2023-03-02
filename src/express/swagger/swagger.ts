/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import swaggerAutogen from 'swagger-autogen';
import path from 'path';
import fs from 'fs';

const doc = {
	info: {
		title: 'My API',
		description: 'Discord Gamble Bot API',
	},
	host: 'localhost:3300',
	schemes: ['http'],
};

const OUTER_FILE_NAME = './swagger-output.json';
const ROUTE_PATH = path.resolve(__dirname, '../routes');
const routeFiles = fs
	.readdirSync(ROUTE_PATH)
	.map(fileName => `${ROUTE_PATH}/${fileName}`);

const endpointsFiles = [...routeFiles];

swaggerAutogen(OUTER_FILE_NAME, endpointsFiles, doc);
