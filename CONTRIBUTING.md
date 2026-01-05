## Getting started

- Fork the repo on GitHub
- Create a local checkout
- From the checkout folder, run the following commands to install dependencies

  ```
  npm ci
  ```

  (This requires the Node and npm are already installed)

- Start VS Code
- Use "Open folder" to open the folder containing the checkout
- Install "VS Code Extension Test Runner"

## Run tests

With the above setup, you can now run our test suite (currently very limited in scope).

For running the tests you can either:

- run from the CLI by doing:

  ```
  npm test
  ```

  You can also run tests directly with `vscode-test`, which supports `--grep` and other options for running a subset of tests.

- run from within VSCode, using the "VS Code Extension Test Runner", and the command: `Test: Run All Tests`

  Note that this tests the output Javascript files, which need to have been built from the Typescript files. Do this by first using `npm run test-compile`, or, more convenientlly, run `tsc` in the background continuously with  `npm run watch-test`.

  There are other `Test: ` commands in VS Code for running a subset of tests.


See [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension) for background on this.

## Formatting

Please VS Code's built-in formatter for Typescript/Javascript code. For other files, your editor should also respect the `.editorconfig` file.


## Debugging

There is a VSCode task `Run Extension` defined in `.vscode/launch.json` which builds the extension, opens a VSCode instance in extension debugging mode with the newly built extensions installed. This puts your editor (with the edamagit project open) in debug mode and allows you to test and debug during development.

To use it, use `View/Run` and select `Run Extension`.

## Build

`npm run vscode:prepublish` - create a production build
`npm run build` - build dev


## Publishing a new version

`develop` is the main branch in this project.

1. When releasing a new version merge the work into this branch
2. Bump the package version number using one of:

   ```
   npm version patch
   npm version minor
   npm version major
   ```

3. Add a changelog entry and commit
4. Add a tag with the name `v{new_version}` and push it to the remote.
5. The CD pipeline will pick up from here.

## CD pipeline

There is a Github action pipeline set up with a trigger on a new tag with the prefix `v`.
The pipeline is defined by the files in `.github/workflows/`.

This pipeline runs actions for building and publishing to `OpenVSX` and `Visual Studio Marketplace`.

## Manually publishing a release

This requires the tokens to the identity managing the extension.
Use vscode extension cli tool to publish.
