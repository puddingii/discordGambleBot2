export interface ToolConstructor {
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	curPower: number;
	type: string;
}

export default abstract class {
	curPower: ToolConstructor['curPower'];
	destroyCnt: ToolConstructor['destroyCnt'];
	failCnt: ToolConstructor['failCnt'];
	successCnt: ToolConstructor['successCnt'];
	type: ToolConstructor['type'];

	constructor({ destroyCnt, failCnt, successCnt, curPower, type }: ToolConstructor) {
		this.type = type;
		this.destroyCnt = destroyCnt ?? 0;
		this.failCnt = failCnt ?? 0;
		this.successCnt = successCnt ?? 0;
		this.curPower = curPower ?? 0;
	}
}
