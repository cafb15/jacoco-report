const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const xml2js = require('xml2js');
const process = require('./process');
const render = require('./render');

async function action() {
    try {
        const jacocoPath = core.getInput('path');
        const title = core.getInput('title');
        const event = github.context.eventName;

        core.info(`Event is ${event}`);

        let base;
        let head;
        let prNumber;

        if (event === 'pull_request' || event === 'pull_request_target') {
            base = github.context.payload.pull_request.base.sha;
            head = github.context.payload.pull_request.head.sha;
            prNumber = github.context.payload.pull_request.number;
        } else {
            throw `Only pull requests are supported, ${github.context.eventName} not supported.`;
        }

        core.info(`base sha: ${base}`)
        core.info(`head sha: ${head}`)

        const repoToken = core.getInput('token')
        const client = github.getOctokit(repoToken);

        await getArtifact(client)

        const reportJsonAsync = getJsonReport(jacocoPath);
        const reportJson = await reportJsonAsync;

        const overallCoverage = process.getOverallCoverage(reportJson['report'])

        core.setOutput('coverage-overall', parseFloat(overallCoverage.project.toFixed(2)));

        if (prNumber != null) {
            await addComment(
                prNumber,
                render.getPRComment(
                    overallCoverage.project,
                    title
                ),
                client
            );
        }
    } catch (error) {
        core.setFailed(error);
    }
}

async function getJsonReport(jacocoPath) {
    let parser = new xml2js.Parser(xml2js.defaults['0.2']);
    const jacocoReport = await fs.promises.readFile(jacocoPath.trim(), 'utf-8');
    return await parser.parseStringPromise(jacocoReport);
}

async function addComment(prNumber, body, client) {
    await client.rest.issues.createComment({
        issue_number: prNumber,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        body: body
    });
}

async function getArtifact(client) {
    let artifact_branch;
    let artifact_owner = github.context.repo.owner;
    let artifact_repo = github.context.repo.repo;

    const repo = await client.rest.repos.get({
        owner: artifact_owner,
        repo: artifact_repo
    })

    const artifact = await client.rest.repos.get({
        owner: artifact_owner,
        repo: artifact_repo,
        name: 'app-coverage-report'
    })

    artifact_branch = repo.data.default_branch

    core.info(`Artifacts repo: ${artifact_owner}/${artifact_repo}`)
    core.info(`Artifacts branch: ${artifact_branch}`)
    core.info(`Artifact: ${JSON.stringify(artifact)}`)
}

module.exports = {
    action
};