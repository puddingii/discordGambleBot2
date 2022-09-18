/**
 * Tool Abstract Constructor params
 * @typedef {Object} WeaponInfo
 * @property {number} destroyCnt 파괴 카운트
 * @property {number} failCnt 실패 카운트
 * @property {number} successCnt 성공 카운트
 * @property {number} curPower 현재 강화된 정도
 * @property {string} type 종류
 */

module.exports = class ToolAbstract {
	/** @param {WeaponInfo} */
	constructor({ destroyCnt, failCnt, successCnt, curPower, type }) {
		this.type = type;
		this.destroyCnt = destroyCnt ?? 0;
		this.failCnt = failCnt ?? 0;
		this.successCnt = successCnt ?? 0;
		this.curPower = curPower ?? 0;
	}
};
