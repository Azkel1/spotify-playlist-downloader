import { config_file_schema } from "./schemas.ts";
import * as v from "@valibot/valibot";

export let config: v.InferOutput<typeof config_file_schema>;

try {
	const config_file = JSON.parse(Deno.readTextFileSync("config.json"));
	const parse_result = v.safeParse(config_file_schema, config_file);

	if (!parse_result.success) {
		console.error(
			"\x1b[1;31m",
			parse_result.issues.map((issue) => issue.message).join("\n"),
		);
		Deno.exit(1);
	}

	config = parse_result.output;
} catch (err) {
	if (err instanceof SyntaxError) {
		console.error(`\x1b[1;31m${err.message}`);
	} else {
		console.error(
			"\x1b[1;31mError opening the configuration file ('config.json'). Make sure you renamed 'config.example.json' and edited the values",
		);
	}

	Deno.exit(1);
}
