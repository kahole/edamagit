
## Debugging
There is a VSCode task `Run Extension` defined in `.vscode/launch.json` which builds the extension and opens a VSCode instance in extension debugging mode. This puts your editor (with the edamagit project open) in debug mode and allows you to test and debug during development.

## Build
`npm run vscode:prepublish` - create a production build
`npm run build` - build dev


## Publishing a new version

`develop` is the main branch in this project.

1. When releasing a new version merge the work into this branch
2. then make a new commit bumping the version number and adding a changelog entry.
3. Add a tag with the name `v{new_version}` and push it to the remote.
4. The CD pipeline will pick up from here.

## CD pipeline

There is a Github action pipeline set up with a trigger on a new tag with the prefix `v`.
The pipeline is defined by the files in `.github/workflows/`.

This pipeline runs actions for building and publishing to `OpenVSX` and `Visual Studio Marketplace`.

## Manually publishing a release

This requires the tokens to the identity managing the extension.
Use vscode extension cli tool to publish. 