# bidrag-cucumber

bidrag-cucumber (https://github.com/navikt/bidrag-cucumber) er et node prosjekt som bruker cucumber-js og egne script for å teste bidrag mikrotjenester.

Dette prosjektet inneholder også alle cucumber features og step definitions (fixture code) for alle bidrag mikrotjenester.

Innhold

1. [Fasit modul](#fasit)
2. [Testressurser](#testressurser)
3. [Fixture code](#fixturecode)
4. [Arrow functions](#arrowfunctions)
5. [Kjøre fra Jenkins](#runjenkins)
6. [Kjøre fra utviklerimage](#runlocal)
7. [HTML Rapporter](#htmlreport)

## Fasit modul <a name='fasit'></a>

Sentralt i cucumber oppsettet er fasit modulen (bidrag-cucumber/fasit) som har kode for følgende:

- Gjøre oppslag mot fasit.adeo.no for å finne URL, passord etc til navngitte tjenester
- Skaffe id-token for miljøet det kjøres i
- Tilby forenklet http get, put, delete og post hvor man kun oppgir tjeneste og miljø

Fasit modulen benytter seg av følgende environment variabler for å fungere:

| ENV         | Default                                | Beskrivelse                                                                                                                                                                                                                                    |
| ----------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fasit_user  |                                        | Brukernavn med rettigheter til å lese passord for bisys ressurser                                                                                                                                                                              |
| fasit_pass  |                                        | Passord for fasit_user                                                                                                                                                                                                                         |
| test_user   |                                        | Brukernavn testene skal kjøres på vegne av (e.g Z990503). Testbruker kan lages i https://ida.adeo.no og må lages i henhold til [ABAC klartekstpolicies for domene "bidrag"](https://confluence.adeo.no/pages/viewpage.action?pageId=309322099) |
| test_pass   |                                        | Passord for test_user                                                                                                                                                                                                                          |
| environment | q0                                     | Fasit miljø det hentes ressurser fra                                                                                                                                                                                                           |
| fasit_url   | https://fasit.adeo.no/api/v2/resources | URL til fasit                                                                                                                                                                                                                                  |
| oidc_alias  | bidrag-dokument-ui-oidc                | Fasit-ressurs for OIDC detaljer                                                                                                                                                                                                                |

## Testressurser <a name='testressurser'></a>

Alle tester ligger i bidrag-cucumber og på rot-nivå i prosjektet lages følgende filstruktur (uavhengig om tjenesten er node eller java basert):

```
cucumber/
     features/
           step_definitions/
                 stepdefs.js
                 .....
           <mikrotjeneste1>.feature
           <mikrotjeneste2>.feature
```

I "features" katalogen legges feature testene og i "step_definitions" legges javascript kode som benyttes i testene. Les mer om cucumber på https://docs.cucumber.io.

Scriptene i step_definitions bør inkludere fasit fra bidrag-cucumber. Fasit scriptet gjør det enkelt å kalle en REST tjeneste ved hjelp av en fasit alias og miljø. Sjekk javascript ressursene for funksjoner slik at vi ikke ender opp med varianter/duplikater. Er koden av generell interesse bør den lagres i shared.js. Ellers er navngivingen av filer i step_definitions kun underlagt sunn fornuft.

<i>PS! bidrag-cucumber.feature inneholder en (enkel) test som sjekker om det finnes duplikater i step_definitions</i>

I feature katalogen navngis features med prefix "mikrotjeneste.", hvor mikrotjeneste er navnet på mikrotjenesten testene gjelder. Ved bygg i Jenkins kjøres alle testene som matcher mikrotjenesten som bygges slik at hvert individuelle bygg kun får sine egne tester lagt ved cucumber rapporten.

Eksempel stepdefs.js:

```
{ httpGet } = require('fasit')
{ Given, When, Then } = require('cucumber')

Given('fasit env {string}', function(fasitenv) {
     this.fasitenv = fasitenv
})

When('jeg gjør kall til {string}', function(alias, done) {
    httpGet(alias, this.fasitenv, "/suffix-til-url-fra-fasit")
     .then(response => {
          this.response = response
          // Når vi bruker async funksjoner må vi ta med et ekstra
          // parameter i funksjonen (e.g. done) slik at vi kan fortelle
          // cucumber når vi er klare til å gå videre.
          // For funksjoner som ikke gjør async kall trenger vi ikke denne.
          done()         
     .catch(err => {
          // Hvis det feiler sender vi med error objekt eller melding
          done(err)
     })
}

Then('skal statuskoden være {string}', function(status) {
     assert(this.response.statusCode == status, `Forventet ${status} fikk ${this.response.statusCode}`)
})
```

Eksempel feature:
```
Feature: test feature
     Tester REST kall - Background seksjonen blir utført for
     alle scenarier og er et bra sted å angi fellesverdier/defaults.
   
     Background: Defaults
          Given fasit env 'q0'
          
     Scenario: testkall til bidragSak
          When jeg gjør kall til 'bidragSak'
          Then skal statuskoden være '200'
          
```

## Fixture Code <a name='fixturecode'></a>
All koden for feature testene ligger i diverse javascript filer under cucumber/features/step_definitions. En av testene til bidrag-cucumber selv er å verifisere at det ikke finnes funksjoner med samme "navn". I den testen skrives også alle Given/When/Then funksjonene ut som et vedlegg til testen, noe som gir en oversikt over hva som finnes av uttrykk som kan brukes i feature filene.

Sjekk http://a34apvl00118.devillo.no:8080/job/bidrag-cucumber/ og finn et bygg som inkludere bidrag-cucumber (eller bare kjør den selv) og se under scenariet "Sjekk duplikater i fixture code". Der skal det være et vedlegg under "Then there should be no duplicates" som lister alle funksjoner og i hvilken fil de er definert:


```
{
    "jeg endrer journalpost til": "cucumber/features/step_definitions/avvik.js",
    "avvikstype {string}": "cucumber/features/step_definitions/avvik.js",
    "journalpostID {string}": "cucumber/features/step_definitions/avvik.js",
    "enhetsnummer {string}": "cucumber/features/step_definitions/avvik.js",
    "beskrivelse {string}": "cucumber/features/step_definitions/avvik.js",
    "jeg søker etter oppgaver for journalpost": "cucumber/features/step_definitions/avvik.js",
    ......
}
```

## Arrow functions <a name='arrowfunctions'></a>

Cucumber-js lager et javascript-objekt som de kaller World objektet. Dette objektet blir "this" variabelen i alle Given/When/Then funksjoner slik at kode/funksjoner kan dele data i et scenario. World objektet blir nullstilt i hvert scenario så det er i utgangspunktet ikke mulig å dele data mellom to scenarier.

Hvis man bruker arrow functions i Given/When/Then deklarasjonen så mister man tilgangen til World objektet (google it). Derfor må alle funksjoner bruke "gammel" måte som:

```
When('jeg ringer hjem', function() {
})
```

og ikke

```
When('jeg ringer hjem', () => {
})
```

Inne i selve funksjonen bør man derimot bruke arrow functions slik at "this" alltid peker til World:

```
When('jeg ringer hjem', function(done) {
     httpGet(this.alias, this.env, '/suffix').then ( response => {
          this.response = response         // <--- this peker til world
          done()                           // <--- forteller cucumber vi er klare til neste steg i scenario
     })
})

When('jeg sjekker resultat', function() {
      console.log(this.response)          // <--- this peker til World
})
```

Om begge funksjonene kalles innefor samme scenario vil this.response være tilgjengelig for 'jeg sjekker resultat' funksjonen.

<i>
     PS Det spiller ingen rolle om man definerer funksjoner med Given, When eller Then. Resultat er nøyaktig det samme.
</i>

## Kjøre fra Jenkins <a name='runjenkins'></a>

Den enkleste måten å kjøre testene i cucumber på er via Jenkins: http://a34apvl00118.devillo.no:8080/job/bidrag-cucumber/

Bruk "Build with parameters" linken og spesifiser miljø og prosjekt. Når jobben er kjørt klikk deg inn på loggen for kjøringen og velg "Cucumber reports" for å vise resultatet av testene.

## Kjøre fra utviklerimage <a name='runlocal'></a>
For å teste lokalt før man eventuelt sjekker inn kode i prosjektet kan man kjøre tester fra utviklerimage ved å sette opp noen environment variabler før kjøring.

Sørg for at alle node moduler er lastet ned
```
$ cd bidrag-cucumber
$ npm install
```

Deretter kan man starte cucumber-js for å kjøre tester i feature-filene:
```
$ export fasit_user=<fasit username>
$ export fasit_pass=<fasit password>
$ export test_user=<test username>
$ export test_pass=<test password>
$ export NODE_TLS_REJECT_UNAUTHORIZED=0
$ node_modules/cucumber/bin/cucumber-js --format json:cucumber_report.json cucumber/features/bidrag-cucumber.feature
```
Dette vil gi output til skjerm men også til filen 'cucumber_report.json' som man kan bruke til å generere en mer leselig HTML rapport. 

## HTML rapport <a name='htmlreport'></a>

For å lage en HTML rapport må man installere en ekstra node modul (https://www.npmjs.com/package/cucumber-html-reporter):

```
$ npm install cucumber-html-reporter --save-dev
```
Deretter må det lages en report.js som lager rapporten. Innholdet av denne kan være:
```
var reporter = require('cucumber-html-reporter');
 
var options = {
        theme: 'bootstrap',
        jsonFile: 'cucumber_report.json',
        output: 'report/cucumber_report.html',
        reportSuiteAsScenarios: true,
        launchReport: true,
        metadata: {
            "App Version":"0.3.2",
            "Test Environment": "STAGING",
            "Browser": "Chrome  54.0.2840.98",
            "Platform": "Windows 10",
            "Parallel": "Scenarios",
            "Executed": "Remote"
        }
    };
 
    reporter.generate(options);

```
Gitt at vi har cucumber_report.json fra tidligere steg kan rapporten lages:
```
$ mkdir report
$ node report.js
```

