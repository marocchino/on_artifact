import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {exec} from '@actions/exec'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const token = core.getInput('GITHUB_TOKEN')
    const name: string = core.getInput('name')
    const path: string = core.getInput('path') || name
    const runId = Number(core.getInput('run_id'))
    const octokit = getOctokit(token, {})

    const artifacts = await octokit.actions.listWorkflowRunArtifacts({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: runId
    })
    const matchArtifact = artifacts.data.artifacts.filter(
      artifact => artifact.name === name
    )[0]
    const download = await octokit.actions.downloadArtifact({
      owner: context.repo.owner,
      repo: context.repo.repo,
      artifact_id: matchArtifact.id,
      archive_format: 'zip'
    })
    const filePath = `${name}.zip`
    fs.writeFileSync(filePath, Buffer.from(download.data as string))

    // unzip
    await exec('unzip', [filePath, '-d', path])
    await exec('rm', [filePath])

    // set outputs
    const fileNames = fs.readdirSync(path)
    for (const fileName of fileNames) {
      core.setOutput(fileName, fs.readFileSync(`${path}/${fileName}`))
      await exec('rm', [`${path}/${fileName}`])
    }

    // delete artifact
    await octokit.actions.deleteArtifact({
      owner: context.repo.owner,
      repo: context.repo.repo,
      artifact_id: matchArtifact.id
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
