function getOverallCoverage(report) {
    const module = {};
    module.name = report['$'].name;
    module.coverage = getModuleCoverage(report);

    const coverage = {};
    coverage.project = getProjectCoverage(report['counter']);
    coverage.modudle = module;

    return coverage;
}

function getProjectCoverage(counters) {
    const coverage = {};

    counters.forEach((counter) => {
        const attr = counter['$'];
        let missed = 0;
        let covered = 0;

        if (attr['type'] === 'INSTRUCTION') {
            missed = parseInt(attr['missed']);
            covered = parseInt(attr['covered']);

            coverage.instuctionMissed = missed;
            coverage.instuctionCovered = covered;
            coverage.instructionPercentage = parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
        }

        if (attr['type'] === 'BRANCH') {
            missed = parseInt(attr['missed']);
            covered = parseInt(attr['covered']);

            coverage.branchMissed = missed;
            coverage.branchCovered = covered;
            coverage.branchPercentage = parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
        }
    });

    return coverage;
}

function getModuleCoverage(report) {
    const counters = report['counter'];
    const coverage = getDetailedCoverage(counters, 'INSTRUCTION');

    return coverage;
}

function getDetailedCoverage(counters, type) {
    const coverage = {};
    counters.forEach((counter) => {
        const attr = counter['$'];

        if (attr['type'] === type) {
            const missed = parseFloat(attr['missed']);
            const covered = parseFloat(attr['covered']);

            coverage.missed = missed;
            coverage.covered = covered;
            coverage.percentage = parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
        }
    });

    return coverage;
}

module.exports = {
    getOverallCoverage
}