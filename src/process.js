function getOverallCoverage(report) {
    const module = {};
    module.name = report['$'].name;
    module.coverage = getModuleCoverage(report);

    const coverage = {};
    coverage.project = getProjectCoverage(report['package']);
    coverage.modudle = module;

    return coverage;
}

function getProjectCoverage(packages) {
    const coverage = {};
    coverage.missed = 0;
    coverage.covered = 0;

    packages.forEach((item) => {
        const counters = item['counter'];

        counters.forEach((counter) => {
            const attr = counter['$'];

            if (attr['type'] === 'INSTRUCTION') {
                coverage.missed += parseInt(attr['missed']);
                coverage.covered += parseInt(attr['covered']);
            }
        });
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