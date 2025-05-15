import lint from "@steebchen/lint-next";

/** @type {import("eslint").Linter.Config[]} */
export default [
	...lint,
	{
		rules: {
			"@typescript-eslint/consistent-type-assertions": "off",
			"max-nested-callbacks": "off",
			complexity: "off",
			"max-depth": "off",
			"max-params": "off",
		},
	},
	{
		ignores: ["**/.source/"],
	},
];
