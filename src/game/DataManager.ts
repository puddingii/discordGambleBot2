import Stock from './Stock/Stock';
import Coin from './Stock/Coin';
import Sword from './Weapon/Sword';

interface DataInfo {
	stock: Array<Stock>;
	coin: Array<Coin>;
	weapon: Array<Sword>;
	status: { code: number };
}

interface DataConstructor<T extends keyof DataInfo> {
	dataInfo: Map<T, DataInfo[T]>;
}

interface GetDataOptions {}

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

	/** 데이터가 리스트로 담겨있다면 해당 메소드를 사용해서 데이터를 추가할 수 있다. */
	addData<T extends keyof DataInfo>(type: T, dataList: DataInfo[T]) {
		const existedList = this.dataInfo.get(type);
		if (!Array.isArray(dataList) || !Array.isArray(existedList)) {
			return;
		}

		if (existedList) {
			this.dataInfo.set(type, [...existedList, ...dataList]);
		} else {
			this.dataInfo.set(type, dataList);
		}
	}

	// FIXME
	getData(type: keyof DataInfo, listOptions?: GetDataOptions) {
		const data = this.dataInfo.get(type);
		if (!listOptions) {
			return data;
		}

		// if (Array.isArray(data) && listOptions) {
		// 	data.find(value => {
		// 		return
		// 	})
		// }
	}

	setData<T extends keyof DataInfo>(type: T, dataList: DataInfo[T]) {
		this.dataInfo.set(type, dataList);
	}
}
