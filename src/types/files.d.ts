/** Dependency Injection File Bot */
declare namespace DIFB {
	interface Config {
		logger: typeof import('../config/logger');
		util: typeof import('../config/util');
		secretKey: typeof import('../config/secretKey');
	}

	interface Models {
		UserModel: typeof import('../model/User');
		StockModel: typeof import('../model/Stock');
		StatusModel: typeof import('../model/Status');
	}

	interface Controllers {}

	export interface FilesDI extends Config, Models, Controllers {}
}
