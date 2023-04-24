function getOverallCoverage(report) {
    const coverage = {};
    coverage.name = report['$'].name;
    coverage.project = getDetailedCoverage(report['counter']);
    coverage.packages = getPackagesCoverage(report['package'])

    return coverage;
}

function getPackagesCoverage(packages) {
    const coverage = [];

    packages.forEach((item) => {
        const value = {};
        value.name = item['$']['name'];
        value.coverage = getDetailedCoverage(item['counter']);
    });

    return coverage;
}

function getDetailedCoverage(counters) {
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

module.exports = {
    getOverallCoverage
}