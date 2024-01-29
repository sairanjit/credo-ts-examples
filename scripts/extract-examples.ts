import { lstatSync, readdirSync, writeFileSync } from "fs";
import path from "path";

interface Example {
	id: string;
	name: string;
	path: string;
	description: string;
}

const rootDir = path.join(__dirname, "..");
const examplesDir = path.join(rootDir, "examples");

const files = readdirSync(examplesDir);
const examples: Example[] = [];

for (const file of files) {
	const filePath = path.join(examplesDir, file);
	const fileInfo = lstatSync(filePath);

	if (fileInfo.isDirectory()) {
		const packageJson = require(path.join(filePath, "package.json"));
		const exampleRelativePath = path.relative(rootDir, filePath);

		examples.push({
			id: file,
			name: toHumanCase(file),
			path: exampleRelativePath,
			description: packageJson.description,
		});
	} else {
		console.log(`Skipping file ${file} as it's not a directory`);
	}
}

writeFileSync(
	path.join(rootDir, "examples.json"),
	// Make sure format matches biome.js
	`${JSON.stringify(examples, null, '\t')}\n`,
);
writeFileSync(path.join(rootDir, "EXAMPLES.md"), generateExamplesMd(examples));

function generateExamplesMd(examples: Example[]) {
	const getExampleRow = (example: Example) =>
		`- [${example.name}](./${example.path}) (\`${example.id}\`) - ${example.description}`;
	return `# List of Examples

> [!TIP]
> You can run an example by executing \`pnpm example <example-id>\`. The example id is included for each example below in \`(<example-id>)\`.

${examples.map(getExampleRow).join("\n")}
`;
}

function toHumanCase(name: string) {
	const words = name.match(/[A-Za-z][a-z]*/g) || [];

	return words.map(capitalizeWord).join(" ");
}

function capitalizeWord(word: string) {
	return word.charAt(0).toUpperCase() + word.substring(1);
}
