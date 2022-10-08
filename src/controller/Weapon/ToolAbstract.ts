type ToolInfo = {
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	curPower: number;
	type: string;
};

export type ToolConstructor = Omit<Partial<ToolInfo>, 'type'> & Pick<ToolInfo, 'type'>;

export default abstract class ToolAbstract {
	curPower: ToolInfo['curPower'];
	destroyCnt: ToolInfo['destroyCnt'];
	failCnt: ToolInfo['failCnt'];
	successCnt: ToolInfo['successCnt'];
	type: ToolInfo['type'];

	constructor({ destroyCnt, failCnt, successCnt, curPower, type }: ToolConstructor) {
		this.type = type;
		this.destroyCnt = destroyCnt ?? 0;
		this.failCnt = failCnt ?? 0;
		this.successCnt = successCnt ?? 0;
		this.curPower = curPower ?? 0;
	}
}
