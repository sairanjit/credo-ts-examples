import path from "path";

if (!process.argv[2]) {
	throw new Error(
		"Please specify example name. \nCommand: pnpm example <example-name>\nExample: \npnpm example endorse-did",
	);
}

const exampleDir = path.join(__dirname, "..", "examples", process.argv[2]);
require(exampleDir);
