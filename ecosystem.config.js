module.exports = {
	apps: [
		{
			name: 'Discord Gamble Bot',
			script: './build/app.js',
			watch: ['build'],
			watch_delay: 1000,
			env: {
				NODE_ENV: 'production',
			},
			ignore_watch: ['node_modules', 'log'],
		},
	],
};
