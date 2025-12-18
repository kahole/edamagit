
## Readying a new release

`develop` is the main branch in this project.

1. When releasing a new version merge the work into this branch
2. then make a new commit bumping the version number and adding a changelog entry.
3. Add a tag with the name `v{new_version}`
4. The CD pipeline will pick up from here.

## CD pipeline

There is a Github action pipeline set up with a trigger on a new tag with the prefix `v`.

This pipeline runs actions for building and publishing to `OpenVSX` and `Visual Studio Marketplace`.

