import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import echarts from 'echarts';
import sharp from 'sharp';
import dayjs from 'dayjs';
import dependency from '../../config/dependencyInjection';

const {
	cradle: { StockModel, logger },
} = dependency;

type ChartOption = {
	xAxis: {
		data: Array<string>;
	};
	yAxis: object;
	series: Array<{ type: string; data: Array<number | Array<number>> }>;
	backgroundColor: string;
};

export default {
	data: new SlashCommandBuilder()
		.setName('차트보기')
		.setDescription('주식 or 코인 차트보기')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('차트종류').setDescription('스틱, 라인 차트').addChoices(
				{
					name: '캔들스틱',
					value: 'stick',
				},
				{
					name: '라인',
					value: 'line',
				},
			),
		)
		.addNumberOption(option =>
			option.setName('시간봉').setDescription('몇시간 봉으로 할건지?').addChoices(
				{
					name: '8시간(기본값)',
					value: 8,
				},
				{
					name: '16시간',
					value: 16,
				},
				{
					name: '1일',
					value: 24,
				},
				{
					name: '3일',
					value: 72,
				},
			),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const name = interaction.options.getString('이름') ?? '';
			const stickTime = interaction.options.getNumber('시간봉') ?? 8;
			const chartType = interaction.options.getString('차트종류') ?? 'stick';

			const stockInfo = await StockModel.findByName(name);
			if (!stockInfo) {
				await interaction.reply({ content: '주식정보를 찾을 수 없습니다.' });
				return;
			}

			const chart = echarts.init(null, undefined, {
				renderer: 'svg',
				ssr: true,
				width: 1600,
				height: 800,
			});

			const chartOptions: ChartOption = {
				xAxis: {
					data: [],
				},
				yAxis: {},
				series: [{ type: chartType === 'stick' ? 'candlestick' : 'line', data: [] }],
				backgroundColor: '#FFFFFF',
			};

			const type = 'stock';
			const stickPerCnt = stickTime / (type === 'stock' ? 2 : 0.5);
			let historyStartIdx = stockInfo.updHistory.length - stickPerCnt * 30;
			let beforeHistory = 0;
			historyStartIdx = historyStartIdx < 0 ? 0 : historyStartIdx;
			for (
				historyStartIdx;
				historyStartIdx < stockInfo.updHistory.length;
				historyStartIdx += stickPerCnt
			) {
				const stickData = stockInfo.updHistory.slice(
					historyStartIdx,
					historyStartIdx + stickPerCnt,
				);
				const stickLastIdx = stickData.length - 1;
				if (stickData.length === -1) {
					break;
				}
				const valueList = stickData.map(data => data.value);
				beforeHistory && valueList.unshift(beforeHistory);
				const stickValue =
					chartType === 'stick'
						? [
								valueList[0],
								valueList[stickLastIdx],
								Math.min(...valueList),
								Math.max(...valueList),
						  ]
						: valueList[stickLastIdx];
				beforeHistory = valueList[stickLastIdx];
				chartOptions.xAxis.data.push(dayjs(stickData[0].date).format('MM.DD'));
				chartOptions.series[0].data.push(stickValue);
			}

			// 스틱차트는 총 30개로, 스틱 하나당 8시간
			chart.setOption(chartOptions);

			// 차트 이미지 생성
			const svgStr = chart.renderToSVGString();
			const imageBuf = await sharp(Buffer.from(svgStr)).jpeg().toBuffer();

			await interaction.reply({ files: [imageBuf] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
