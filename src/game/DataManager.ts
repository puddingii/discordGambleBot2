import Stock from './Stock/Stock';
import Coin from './Stock/Coin';
import Sword from './Weapon/Sword';

interface DataInfo {
	stock: Stock;
	coin: Coin;
	weapon: Sword;
}

interface DataConstructor<T extends keyof DataInfo> {
	dataInfo: Map<T, Array<DataInfo[T]>>;
}

export default class DataManager {
	private static instance: DataManager;
	public static getInstance() {
		if (DataManager.instance) {
			DataManager.instance = new DataManager();
		}
		return DataManager.instance;
	}
	dataInfo: DataConstructor<keyof DataInfo>['dataInfo'];

	private constructor() {
		this.dataInfo = new Map();
	}

	addData<T extends keyof DataInfo>(type: T, dataList: Array<DataInfo[T]>) {
		const existedList = this.dataInfo.get(type);

		if (existedList) {
			this.dataInfo.set(type, [...existedList, ...dataList]);
		} else {
			this.dataInfo.set(type, dataList);
		}
	}

	getDataList(type: keyof DataInfo) {
		return this.dataInfo.get(type);
	}

	setData<T extends keyof DataInfo>(type: T, dataList: Array<DataInfo[T]>) {
		this.dataInfo.set(type, dataList);
	}
}
