function getPRComment(overallCoverage, title) {
    const overallTable = getOverallTable(overallCoverage);
    const heading = getTitle(title);

    return heading + '\n\n' + overallTable
}

function getOverallTable(coverage, coverageRules) {
    const project = coverage['project'];
    const packages = coverage['packages'];

    const status = getStatus(project.instructionPercentage);

    const tableHeader = `|Element|Instructions covered|Branches covered|Status|`;
    const tableStructure = `|:-|:-:|:-:|:-:|`;
    const footer = `|${coverage['name']}|${formatCoverage(project.instructionPercentage)}|${formatCoverage(project.branchPercentage)}|${status}|`;

    let table = `${tableHeader}\n${tableStructure}`;

    packages.forEach((item) => {
        table += '\n' + getRow(item['name'], item['coverage']);
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

function getRow(name, coverage) {
    let status = getStatus(coverage.instructionPercentage);
    return `|${name}|${formatCoverage(coverage.instructionPercentage)}|${formatCoverage(coverage.branchPercentage)}|${status}|`;
}

function getStatus(coverage) {
    return `:green_apple:`
}

function formatCoverage(coverage) {
    return `${parseFloat(coverage.toFixed(2))}%`;
}

module.exports = {
    getPRComment
}