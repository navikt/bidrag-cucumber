const assert = require('assert');
const {
    Given,
    When,
    Then
} = require('cucumber');

Given('given is {string}', function (given) {
    this.given = given;
    return given;
});

Given('surname is {string}', function (surname) {
    this.surname = surname;
    return surname;
});

When('I call compute-name', function () {
    this.fullname = [this.given, this.surname].join(" ");
});

Then('I should have fullname {string}', function (string) {
    return assert.equal(string, this.fullname, "Fullname mismatch");
});