const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const xml2js = require('xml2js');
const process = require('./process');
const render = require('./render');

async function action() {
    try {
        const jacocoPath = core.getInput('path');
        const jacocoPaths = core.getInput('paths');
        const title = core.getInput('title');
        const jacocoRulesPath = core.getInput('rules-path');
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
        const jacocoRules = await getJacocoRules(jacocoRulesPath);

        if (jacocoPath !== "") {
            await reportForSinglePath(jacocoPath, jacocoRules, prNumber, title, client);
        } else if (jacocoPaths !== "") {
            await reportForPaths(jacocoPaths, jacocoRules, prNumber, title, client);
        }
    } catch (error) {
        core.setFailed(error);
    }
}

async function reportForSinglePath(jacocoPath, jacocoRules, prNumber, title, client) {
    const reportJson = await getJsonReport(jacocoPath);

    const overallCoverage = process.getOverallCoverage(reportJson['report'], jacocoRules);

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
}

async function reportForPaths(jacocoPaths, jacocoRules, prNumber, title, client) {
    const reports = await Promise.all(jacocoPaths.split(',').map(async (report) => await getJsonReport(report)));

    core.info(`reports ${reports}`);

    const coverage = process.getProjectCoverage(reports, jacocoRules);

    core.info(`coverage ${coverage}`);
}

async function getJsonReport(jacocoPath) {
    let parser = new xml2js.Parser(xml2js.defaults['0.2']);
    const jacocoReport = await fs.promises.readFile(jacocoPath.trim(), 'utf-8');
    return await parser.parseStringPromise(jacocoReport);
}

async function getJacocoRules(rulesPath) {
    const jacocoRules = await fs.promises.readFile(rulesPath.trim(), 'utf-8')

    return await JSON.parse(jacocoRules);
}

async function addComment(prNumber, body, client, title) {
    let commentUpdated = false;

    const comments = await client.rest.issues.listComments({
        issue_number: prNumber,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    const comment = comments.data.find((comment) => comment.body.startsWith(`### ${title}`));

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