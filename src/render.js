function getPRComment(overallCoverage, title) {
    const overallTable = getOverallTable(overallCoverage);
    const heading = getTitle(title);

    return heading + '\n\n' + overallTable
}

function getOverallTable(coverage) {
    var status = getStatus(coverage);
    const project = coverage['project'];

    const tableHeader = `|Element|Instructions covered|Branches covered|`;

    const content = `|${coverage['name']}|${formatCoverage(project.instructionPercentage)}|${formatCoverage(project.branchPercentage)}|`;
    const tableStructure = `|:-|:-:|:-:|`;

    return tableHeader + '\n' + tableStructure + '\n' + content;
}

function getTitle(title) {
    if (title != null && title.length > 0) {
        return `### ${title}\n`;
    } else {
        return '';
    }
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