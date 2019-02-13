const assert = require('assert');
const util = require('util');
const { Given, When } = require('cucumber');
const { attachJSON } = require('fasit')

const fs = require('fs')
const rex = /^\s*(Given|When|Then)\('([^\']*)'.*/i

var fixtures = {}

function findFixtures(path, duplicates) {
    console.log(`check ${path}`)
    fs.readFileSync(path, 'UTF-8').split(/[\r\n]/).forEach(line => {
        var m = line.match(rex)
        if(m) {
            var xp = m[2]
            if(fixtures[xp]) {
                duplicates.push({
                    xp: xp,
                    path: path
                })
                console.log(`duplikat for ${xp} i ${path} og ${fixtures[xp]}`)
            } else {
                fixtures[xp] = path
                console.log(`legg til ${xp} i ${path}`)
            }
        }
    })
}

function checkForDuplicateFixtures(dir, duplicates) {
    var files = fs.readdirSync(dir)
    files.forEach( item => {
        findFixtures(`${dir}/${item}`, duplicates)
    })
}

Given('cucumber fixtures in {string}', function(dir) {
    this.dir = dir
})

When('adding the following fixture to {string}:', function (fname, body) {
    try {
        fs.unlink(`${this.dir}/${fname}`)
    } catch(err) {}

    fs.writeFileSync(`${this.dir}/${fname}`, body)
})

When('validating cucumber fixtures', function () {
    this.duplicates = []
    checkForDuplicateFixtures(this.dir, this.duplicates)
})

When('there should be no duplicates', function () {
    if(this.duplicates.length > 0) {
        attachJSON(this, this.duplicates)
    }
    assert.ok(this.duplicates.length == 0, "There are duplicate fixture methods")
})

When('there should be duplicates', function () {
    if(this.duplicates.length > 0) {
        attachJSON(this, this.duplicates)
    }
    assert.ok(this.duplicates.length > 0, "Duplicate fixture methods not detected")
})
