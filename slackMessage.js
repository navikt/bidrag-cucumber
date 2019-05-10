

const fs = require('fs')

const js = JSON.parse(String(fs.readFileSync('cucumber/cucumber.json')))

var msg = [
]

js[0].elements.forEach(element => {
    if (!element.steps.every(step => {
        return step.result.status == "passed"
    })) {
        msg.push(`[FAILED] ${element.id}`)
    } else {
        msg.push(`[  OK  ] ${element.id}`)
    }
});

console.log(msg.join('\n'))