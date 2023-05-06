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

        const overallCoverage = process.getOverallCoverage(reportJson['report']);

        core.setOutput('coverage-overall', parseFloat(overallCoverage['project'].instructionPercentage.toFixed(2)));

        if (prNumber != null) {
            await addComment(
                prNumber,
                render.getPRComment(
                    overallCoverage,
                    title
                ),
                client,
                title
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

async function addComment(prNumber, body, client, title) {
    let commentUpdated = false;

    const comments = await client.rest.issues.listComments({
        issue_number: prNumber,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    core.info(`title ${title}`);
    core.info(`prNumber ${prNumber}`);

    comments.data.forEach((item) => {
        core.info(`comment ${item}`);
    });

    const comment = comments.data.find((comment) => comment.body.startsWith(title));

    if (comment) {
        await client.rest.issues.updateComment({
            comment_id: comment.id,
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            body: body
        });

        commentUpdated = true;
    }

    if (!commentUpdated) {
        await client.rest.issues.createComment({
            issue_number: prNumber,
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            body: body
        });
    }
}

module.exports = {
    action
};