export interface ToolConstructor {
	destroyCnt?: number;
	failCnt?: number;
	successCnt?: number;
	curPower?: number;
	type: string;
}

export default abstract class ToolAbstract {
	curPower: number;
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	type: ToolConstructor['type'];

	constructor({ destroyCnt, failCnt, successCnt, curPower, type }: ToolConstructor) {
		this.type = type;
		this.destroyCnt = destroyCnt ?? 0;
		this.failCnt = failCnt ?? 0;
		this.successCnt = successCnt ?? 0;
		this.curPower = curPower ?? 0;
	}
}
