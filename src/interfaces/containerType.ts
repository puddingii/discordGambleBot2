export default {
	/** Util */
	Util: Symbol.for('Util'),
	Logger: Symbol.for('Logger'),
	Formatter: Symbol.for('Formatter'),

	/** Model */
	UserModel: Symbol.for('UserModel'),
	StockModel: Symbol.for('StockModel'),
	WeaponModel: Symbol.for('WeaponModel'),
	StatusModel: Symbol.for('StatusModel'),

	/** Service */
	UserService: Symbol.for('UserService'),
	StockService: Symbol.for('StockService'),
	WeaponService: Symbol.for('WeaponService'),
	StatusService: Symbol.for('StatusService'),

	/** Controller */
	StatusController: Symbol.for('StatusController'),
	StockController: Symbol.for('StockController'),
	UserController: Symbol.for('UserController'),
	WeaponController: Symbol.for('WeaponController'),
};
