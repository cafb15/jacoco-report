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

        const client = github.getOctokit(core.getInput('token'));

        const reportJsonAsync = getJsonReport(jacocoPath);
        const reportJson = await reportJsonAsync;

        core.info(`report ${JSON.stringify(reportJson, ' ', 4)}`)
        const overallCoverage = process.getOverallCoverage(reportJson)

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
    await client.issues.createComment({
        issue_number: prNumber,
        body: body,
        ...github.context.repo
    });
}

module.exports = {
    action
};