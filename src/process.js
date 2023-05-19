const core = require("@actions/core");

function getOverallCoverage(report, jacocoRules) {
    const coverage = {};
    coverage.name = report['$'].name;
    coverage.project = getDetailedCoverage(report['counter']);
    coverage.packages = getPackagesCoverage(report['package']);

    coverage.minimumInstruction = getInstructionRulesEnabledByModule(
        coverage.name,
        jacocoRules['instructions'],
        jacocoRules['ignore']
    );

    return coverage;
}

function getProjectCoverage(reports, jacocoRules) {
    const coverage = [];

    reports.forEach((item) => {
        const module = {};

        module.name = item['$'].name;
        module.project = getDetailedCoverage(item['counter']);
        module.minimumInstruction = getInstructionRulesEnabledByModule(
            module.name,
            jacocoRules['instructions'],
            jacocoRules['ignore']
        )

        coverage.push(module);
    });

    return coverage;
}

function getInstructionRulesEnabledByModule(moduleName, instructions, modulesIgnored) {
    let minimumInstruction = instructions['threshold'];

    instructions['modules'].forEach((item) => {
        if (item['module'] === moduleName) {
            minimumInstruction = item['threshold'];
        }
    });

    modulesIgnored.forEach((module) => {
        if (module === moduleName) {
            minimumInstruction = 0.0;
        }
    });

    return minimumInstruction;
}

function getPackagesCoverage(packages) {
    const coverage = [];

    packages.forEach((item) => {
        const value = {};
        value.name = item['$']['name'];
        value.coverage = getDetailedCoverage(item['counter']);

        coverage.push(value);
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
    getOverallCoverage,
    getProjectCoverage
}