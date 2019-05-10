

const fs = require('fs')

const js = JSON.parse(String(fs.readFileSync('cucumber/cucumber.json')))

var msg = [
]

msg.push(`Cucumber Testresultater (${process.env.BUILD_NUMBER}) - http://a34apvl00118.devillo.no:8080/job/bidrag-cucumber/${process.env.BUILD_NUMBER}/cucumber-html-reports/overview-features.html`)
js.forEach(feature => {
    msg.push('  Feature: ' + feature.name)
    failed = 0
    ok = 0
    feature.elements.forEach(element => {
        if (!element.steps.every(step => {
            return step.result.status == "passed"
        })) {
            msg.push(`    [FAILED] ${element.id}`)
            failed++
        } else {
            ok++
        }
    })
    msg.push(`    ${ok} tester ok, ${failed} tester med feil`)
})

console.log(msg.join('\n'))