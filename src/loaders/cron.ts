import fs from 'fs';
import path from 'path';

export const loadCron = () => {
	const commandFolder = fs.readdirSync(path.resolve(__dirname, '../cron'));
	const commonCommandFiles = commandFolder.filter(
		file => file.endsWith('.js') || file.endsWith('.ts'),
	);

	// FIXME job 관리 필요해보임
	commonCommandFiles.forEach(file => {
		import(`../cron/${file}`);
	});
};

export default { loadCron };
