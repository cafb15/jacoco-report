function getPRComment(overallCoverage, title) {
    const overallTable = getOverallTable(overallCoverage);
    const heading = getTitle(title);

    return heading + '\n\n' + overallTable
}

function getOverallTable(coverage) {
    const project = coverage['project'];
    const packages = coverage['packages'];
    const minimumInstruction = coverage['minimumInstruction'];

    const status = getStatus(project.instructionPercentage, minimumInstruction);

    const tableHeader = `|Element|Instructions covered|Branches covered|Status|`;
    const tableStructure = `|:-|:-:|:-:|:-:|`;
    const footer = `|${coverage['name']}|${formatCoverage(project.instructionPercentage)}|${formatCoverage(project.branchPercentage)}|${status}|`;

    let table = `${tableHeader}\n${tableStructure}`;

    packages.forEach((item) => {
        table += '\n' + getRow(item['name'], item['coverage'], minimumInstruction);
    });

    return `${table}\n${footer}`;
}

function getTitle(title) {
    if (title != null && title.length > 0) {
        return `### ${title}\n`;
    } else {
        return '';
    }
}

function getRow(name, coverage, minimumInstruction) {
    let status = getStatus(coverage.instructionPercentage, minimumInstruction);
    return `|${name}|${formatCoverage(coverage.instructionPercentage)}|${formatCoverage(coverage.branchPercentage)}|${status}|`;
}

function getStatus(coverage, minimumInstruction) {
    if (coverage < minimumInstruction) {
        return `😭`;
    } else if (coverage - minimumInstruction >= 1 && coverage - minimumInstruction <= 5) {
        return `😱`;
    } else {
        return `🥳`;
    }
}

function formatCoverage(coverage) {
    return `${parseFloat(coverage.toFixed(2))}%`;
}

module.exports = {
    getPRComment
}