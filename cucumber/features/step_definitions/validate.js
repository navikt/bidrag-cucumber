const assert = require('assert');
const util = require('util');
const { Given, When, Then } = require('cucumber');

const fs = require('fs')
const rex = /^\s*(Given|When|Then)\('([^\']*)'.*/i

var fixtures = {}

function findFixtures(path) {
    var duplicates = []
    fs.readFileSync(path, 'UTF-8').split(/\r\n/).forEach(line => {
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
            }
        }
    })
}

function checkForDuplicateFixtures(dir) {
    var files = fs.readdirSync(dir)
    files.forEach( item => {
        findFixtures(`${dir}/${item}`)
    })
}

Given('cucumber fixtures in {string}', function(dir) {
    this.dir = dir
})

When('validating cucumber fixtures', function () {
    this.duplicates = checkForDuplicateFixtures(this.dir)
})

When('there should be no duplicates', function () {
    if(this.duplicates.length > 0) {
        attachJSON(this, this.duplicates)
    }
    assert.ok(this.duplicates.length == 0, "There are duplicate fixture methods")
})


