

const fs = require('fs')

const js = JSON.parse(String(fs.readFileSync('cucumber/cucumber.json')))

var msg = [
]

msg.push(`Cucumber Testresultater - build ${process.env.BUILD_DISPLAY_NAME}`)
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