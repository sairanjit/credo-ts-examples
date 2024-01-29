# Credo Usage Examples

This repository demonstrates how to use [Credo](credo.js.org), and leverage all it's features. It is a collection of examples that can be used as a reference for building your own applications. Each example is a standalone application that can be run independently, and tries to showcase a minimal example of a feature within Credo.

## Getting Started

Make sure you have the following prerequisites installed:

- Node.JS 18+ - [Install](https://nodejs.org/en/download/) (or use [Volta](https://volta.sh/) for managing multiple Node installations).
- pnpm - [Install](https://pnpm.io/installation)

Then, clone the repo and install dependencies:

```sh
git clone https://github.com/sairanjit/credo-ts-examples.git
pnpm install
```

## Running Examples

Once you have installed the dependencies, you can run any of the examples by running the following command:

```
pnpm example <example-name>
```

The `<example-name>` is the directory of the example in the examples directory

## Available Examples

See [EXAMPLES.md](./EXAMPLES.md) for a list of available examples.

## Contributing

If you have an example that you think could be useful to others, and would like to see listed in this repository, feel free to submit a pull request with your example. To make sure examples stay consistent, copy an existing example and modify it to your needs.

After making changes, make sure to run the following commands before opening your PR:

- `pnpm extract-examples`
- `pnpm fix`
