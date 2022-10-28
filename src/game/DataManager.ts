import { ClientSession, startSession } from 'mongoose';
import StockManager from './Stock/StockManager';
import UserManager from './User/UserManager';
import WeaponManager from './Weapon/WeaponManager';
import StatusManager from './Status/StatusManager';

interface DataInfo {
	stock: StockManager;
	weapon: WeaponManager;
	user: UserManager;
	globalStatus: StatusManager;
}

interface DataConstructor<T extends keyof DataInfo> {
	dataInfo: Map<T, DataInfo[T]>;
}

export default class DataManager {
	private static instance: DataManager;
	public static getInstance() {
		if (!DataManager.instance) {
			DataManager.instance = new DataManager();
		}
		return DataManager.instance;
	}
	private dataInfo: DataConstructor<keyof DataInfo>['dataInfo'];
	private transactionSession: ClientSession | null;

	private constructor() {
		this.dataInfo = new Map();
		this.transactionSession = null;
	}

	get<T extends keyof DataInfo>(type: T): DataInfo[T] {
		const dataList = ['stock', 'weapon', 'user', 'globalStatus'];
		if (!dataList.includes(type)) {
			throw Error('잘못된 타입값입니다.');
		}
		const manager = <DataInfo[T]>this.dataInfo.get(type);
		return manager;
	}

	getSession() {
		return this.transactionSession;
	}

	set<T extends keyof DataInfo>(type: T, manager: DataInfo[T]) {
		this.dataInfo.set(type, manager);
	}

	async setTransaction(isEnd = false) {
		if (isEnd && this.transactionSession !== null) {
			this.transactionSession.endSession();
			this.transactionSession = null;
			return;
		}
		if (isEnd && !this.transactionSession) {
			return;
		}
		this.transactionSession = await startSession();
	}
}
