export class SetupError extends Error {
	task: string;
	constructor(message: string, task: string) {
		super(message);
		this.task = task;
		Object.setPrototypeOf(this, SetupError.prototype);
	}
}
