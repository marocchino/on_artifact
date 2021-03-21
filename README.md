<p align="center">
  <a href="https://github.com/marocchino/on_artifact/actions"><img alt="on_artifact status" src="https://github.com/marocchino/on_artifact/workflows/build/badge.svg"></a>
</p>

# on_artifact

Optimized for workflow_run. Download artifact and set as output then clear it

## Usage

```yaml
name: build
on:
  pull_request:
  push:
    branches:
      - main
      - 'releases/*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: |
          npm install
      - run: |
          mkdir -p ./pr
          # this file name `number` will be output variable name later
          echo ${{ github.event.number }} | tee ./pr/number
          # this file name `all_result` will be output variable name later
          npm run all | tee ./pr/all_result
      - uses: actions/upload-artifact@v2
        if: github.event_name == 'pull_request'
        with:
          name: all
          path: pr/


name: Comment on PR

on:
  workflow_run:
    workflows:
      - build
    types:
      - completed

jobs:
  exam:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.event == 'pull_request' }}
    steps:
      - name: on artifact
        id: artifact
        uses: marocchino/on_artifact@v1
        with:
          name: all
          run_id: ${{ github.event.workflow_run.id }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: marocchino/sticky-pull-request-comment@v2
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          header: All
          number: ${{ steps.artifact.outputs.number }}
          message: |
            ```
            ${{ steps.artifact.outputs.all_result }}
            ```
```
## Inputs

### `GITHUB_TOKEN`

**Required** set secrets.GITHUB_TOKEN here

### `name`

**Required** artifact name

### `path`

**Optional** path to unzip it. default is artifact name.

### `run_id`

**Required** set github.event.workflow_run.id here.

## Outputs

any valid file name is passable

## Any problem?

Feel free to report issues. 😃
