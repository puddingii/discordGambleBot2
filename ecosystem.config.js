module.exports = {
	apps: [
		{
			name: 'Discord Gamble Bot',
			script: './src/app.js',
			watch: ['src'],
			watch_delay: 1000,
			env: {
				NODE_ENV: 'production',
			},
			ignore_watch: ['node_modules', 'log'],
		},
	],
};
