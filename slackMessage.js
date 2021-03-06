

const fs = require('fs')

var reportJson = null
try {
    reportJson = String(fs.readFileSync('cucumber/cucumber.json'))
} catch (err) {
    console.log(`Kan ikke åpne cucumber rapport - ${err.message}`)
    return
}

const js = JSON.parse(reportJson)

var msg = [
]

failed = []
ok = 0

msg.push(`Cucumber Testresultater (${process.env.BUILD_NUMBER})`)
js.forEach(feature => {
    feature.elements.forEach(element => {
        if (!element.steps.every(step => {
            return step.result.status == "passed"
        })) {
            failed.push(`    [FAILED] ${element.id}`)
        } else {
            ok++
        }
    })
})

msg.push(`#OK = ${ok}, #Failed=${failed.length}`)
failed.push('')
failed.push(`http://a34apvl00118.devillo.no:8080/job/bidrag-cucumber/${process.env.BUILD_NUMBER}/cucumber-html-reports/overview-features.html`)

if(failed.length > 2) {
    console.log(msg.concat(failed).join('\n'))
}
