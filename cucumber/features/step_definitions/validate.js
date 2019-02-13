const assert = require('assert');
const util = require('util');
const { Given, When } = require('cucumber');
const { attachJSON } = require('fasit')

const fs = require('fs')
const rex = /^\s*(Given|When|Then)\('([^\']*)'.*/i

function findFixtures(path, duplicates, fixtures) {
    fs.readFileSync(path, 'UTF-8').split(/[\r\n]/).forEach(line => {
        var m = line.match(rex)
        if(m) {
            var xp = m[2]
            if(fixtures[xp]) {
                duplicates.push({
                    xp: xp,
                    path: fixtures[xp],
                    duplicateIn: path
                })
            } else {
                fixtures[xp] = path
            }
        }
    })
}

function checkForDuplicateFixtures(dir, duplicates, fixtures) {
    var files = fs.readdirSync(dir)
    files.forEach( item => {
        findFixtures(`${dir}/${item}`, duplicates, fixtures)
    })
}

function removeFile(path) {
    try {
        fs.unlink(path)
    } catch(err) {}
}

Given('cucumber fixtures in {string}', function(dir) {
    this.dir = dir
})

When('adding the following fixture to {string}:', function (fname, body) {
    this.dupfile = `${this.dir}/${fname}`
    fs.writeFileSync(this.dupfile)
})

When('validating cucumber fixtures', function () {
    this.duplicates = []
    this.fixtures = {}
    checkForDuplicateFixtures(this.dir, this.duplicates, this.fixtures)
    removeFile(this.dupfile)
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
