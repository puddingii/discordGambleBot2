import StockManager from './Stock/StockManager';
import UserManager from './User/UserManager';
import WeaponManager from './Weapon/WeaponManager';

interface DataInfo {
	stock: StockManager;
	weapon: WeaponManager;
	user: UserManager;
	globalStatus: { code: number };
}

interface DataConstructor<T extends keyof DataInfo> {
	dataInfo: Map<T, DataInfo[T]>;
}

export default class DataManager {
	private static instance: DataManager;
	public static getInstance() {
		if (DataManager.instance) {
			DataManager.instance = new DataManager();
		}
		return DataManager.instance;
	}
	private dataInfo: DataConstructor<keyof DataInfo>['dataInfo'];

	private constructor() {
		this.dataInfo = new Map();
	}

	get<T extends keyof DataInfo>(type: T): DataInfo[T] {
		const dataList = ['stock', 'weapon', 'user', 'globalStatus'];
		if (dataList.includes(type)) {
			throw Error('잘못된 타입값입니다.');
		}
		const dataManager = <DataInfo[T]>this.dataInfo.get(type);
		return dataManager;
	}

	set<T extends keyof DataInfo>(type: T, dataList: DataInfo[T]) {
		this.dataInfo.set(type, dataList);
	}
}
