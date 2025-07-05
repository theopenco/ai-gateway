import contentCollections from "@content-collections/vinxi";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsConfigPaths from "vite-tsconfig-paths";

// noinspection JSUnusedGlobalSymbols
// export default defineConfig({
// 	tsr: {
// 		appDirectory: "./src",
// 	},
// 	vite: {
// 		plugins: [
// 			contentCollections(),
// 			tsConfigPaths({
// 				projects: ["./tsconfig.json"],
// 			}),
// 			tailwindcss(),
// 			svgr(),
// 		],
// 	},
// });

export default defineConfig({
	server: {
		port: 3006,
	},
	plugins: [
		contentCollections(),
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		svgr(),
		tanstackStart(),
	],
});
