const fs = require('fs')
const {
    execSync
} = require('child_process');

const {
    base64encode,
    base64decode
} = require('nodejs-base64')

const microservices = [
    "bidrag-dokument", "bidrag-dokument-journalpost",
    "bidrag-sak"
]

function scenarioHasFailures(scenario) {
    return scenario.steps.some(step => {
        return step.result.status != "passed"
    })
}

function getStepByKeyword(scenario, keyword) {
    var step = scenario.steps.filter(step => {
        return step.keyword == keyword
    });
    return (step && step.length == 1) ? step[0] : null
}

function getCorrelationId(scenario) {
    var beforeStep = getStepByKeyword(scenario, "Before")
    return beforeStep ? base64decode(beforeStep.embeddings[0].data) : null
}

function getLogsFor(svc, correlationId) {
    var log = []
    var cmdline = `kubectl logs -lapp=${svc} --since=15m | grep '"correlationId"="${correlationId}"`
    console.log(cmdline)

    var stdout = execSync(cmdline, {encoding:'UTF-8'});
    stdout.split("\n").forEach(line => {
        if(line.startsWith('{')) {
            var js = JSON.parse(line)
            log.push(js['@timestamp'] + '   ' + js.message)
        }
    })
    console.error(`return: ${log.length} lines`);
    return log
}

function attachKubelogs(scenario) {
    var correlationId = getCorrelationId(scenario)
    var beforeStep = getStepByKeyword(scenario, "Before")
    if (correlationId) {
        microservices.forEach(svc => {
            var log = getLogsFor(svc, correlationId)
            console.log('got ' + log.length + ' lines')
            beforeStep.embeddings.push({
                mime_type: "text/plain",
                data: base64encode(log.join("\n"))
            })
        })
    }
}

function scanFeature(feature) {
    // console.log(`Feature ${feature.name}`)
    feature.elements.forEach(scenario => {
        if (scenarioHasFailures(scenario)) {
            console.log(`Pull kubectl logs for ${scenario.id}`)
            attachKubelogs(scenario)
        } else {
            // console.log(`OK ${scenario.id}`)
        }
    })
}

report = JSON.parse(fs.readFileSync('cucumber/cucumber.json'))
report.forEach(element => {
    if (element.keyword == "Feature") {
        scanFeature(element)
    }
});

fs.writeFileSync('cucumber/cucumber-with-log.json', JSON.stringify(report))
