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
      - uses: actions/checkout@v4
      - run: |
          npm install
      - run: |
          mkdir -p ./pr
          # this file name `number` will be output variable name later
          echo ${{ github.event.number }} | tee ./pr/number
          # this file name `all_result` will be output variable name later
          npm run all | tee ./pr/all_result
      - uses: actions/upload-artifact@v4
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
        uses: marocchino/on_artifact@v2
        with:
          name: all
      - uses: marocchino/sticky-pull-request-comment@v2
        with:
          header: All
          number: ${{ steps.artifact.outputs.number }}
          message: |
            ```
            ${{ steps.artifact.outputs.all_result }}
            ```
```
## Inputs

### `name`

**Required** artifact name

### `path`

**Optional** path to unzip it. default is artifact name.

### `run_id`

**Optional** set workflow_run id, This defaults to `${{ github.event.workflow_run.id }}`.


### `GITHUB_TOKEN`

**Optional**, typically set `secrets.GITHUB_TOKEN`. If not set, this will use `${{ github.token }}`.

## Outputs

Any valid file name is passable.

## Any problem?

Feel free to report issues. 😃
