/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import swaggerAutogen from 'swagger-autogen';
import path from 'path';

const doc = {
	info: {
		title: 'My API',
		description: 'Discord Gamble Bot API',
	},
	host: 'localhost:3300',
	schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = [path.resolve(__dirname, '../loaders/myExpress.ts')];

swaggerAutogen(outputFile, endpointsFiles, doc);
