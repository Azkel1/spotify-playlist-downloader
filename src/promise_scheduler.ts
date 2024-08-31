export async function create_promise_scheduler<TTaskResult>(
	tasks: Array<() => Promise<TTaskResult>>,
	max_parallel: number,
) {
	const task_count = tasks.length;
	const in_progress = new Map<symbol, Promise<void>>();
	const results: Array<TTaskResult> = [];
	let completed = 0;

	while (completed < task_count) {
		const available = max_parallel - in_progress.size;
		const tasks_to_run = tasks.splice(0, available);

		for (const task of tasks_to_run) {
			const taskSymbol = Symbol();

			in_progress.set(
				taskSymbol,
				task().then((result) => {
					results.push(result);
					completed++;
					in_progress.delete(taskSymbol);
				}),
			);
		}

		await Promise.race(in_progress.values());
		console.log(
			`\x1b[1;33m${task_count - completed}\x1b[0m tasks remaining`,
		);
	}

	return results;
}
