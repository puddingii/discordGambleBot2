/** Dependency Injection File Bot */
declare namespace DIFB {
	interface Config {
		logger: typeof import('../config/logger').default;
		util: typeof import('../config/util').default;
		secretKey: typeof import('../config/secretKey').default;
	}

	interface Models {
		UserModel: typeof import('../model/User').default;
		StockModel: typeof import('../model/Stock').default;
		StatusModel: typeof import('../model/Status').default;
	}

	interface Controllers {}

	export interface FilesDI extends Config, Models, Controllers {}
}
