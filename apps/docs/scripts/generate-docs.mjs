import * as OpenAPI from "fumadocs-openapi";
import { rimraf } from "rimraf";
import { cp } from "node:fs/promises";

const out = "./content/(api)";

async function generate() {
	await rimraf(out, {
		filter(v) {
			return !v.endsWith("index.mdx") && !v.endsWith("meta.json");
		},
	});

	await cp("../gateway/openapi.json", "./openapi.json");

	await OpenAPI.generateFiles({
		input: [
			process.env.NODE_ENV === "production"
				? "https://api.llmgateway.io"
				: "./openapi.json",
		],
		output: out,
	});
}

void generate();
