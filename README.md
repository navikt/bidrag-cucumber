# bidrag-cucumber

bidrag-cucumber (https://github.com/navikt/bidrag-cucumber) er et node prosjekt som bruker cucumber-js og egne script for å teste bidrag mikrotjenester.

Dette prosjektet inneholder også alle cucumber features og step definitions (fixture code) for alle bidrag mikrotjenester.


## Fasit modul

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

## Testressurser

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

<i>PS! bidrag-cucumber.feature inneholder en (enkel) test som sjekker om det finnes duplikater prosjektet</i>

I feature katalogen navngis filene med prefix "mikrotjeneste.", hvor mikrotjeneste er navnet på mikrotjenesten testene gjelder. Ved bygg i Jenkins kjøres alle testene som matcher mikrotjenesten som bygges.

Eksempel stepdefs.js:

```
{ httpGet } = require('fasit')

When('jeg gjør kall til {string} i {string}', function(alias, env, done) {
    httpGet(alias, env, "/suffix-til-url-fra-fasit")
 .then(response => {
    <do stuff>
    done() // Dette må gjøres ved bruk av async kall i koden
}
```

Eksempel feature (e.g. bidrag-sak.feature)

```
Feature: bidrag-sak
   Tester REST API til endepunktet BidragSakController i bidrag-sak.
   URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
   alias til en RestService record i fasit for et gitt miljø.

   Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Given restservice 'bidragSak'

   Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then statuskoden skal være '200'
        And header 'content-type' skal være 'application/json;charset=UTF-8'
        And resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'

   Scenario: Sjekk at vi får bidragssaker som involverer person angitt
        When jeg henter bidragssaker for person med fnr "10099447805"
        Then statuskoden skal være '200'
        And hvert element i listen skal ha følgende properties satt:
        | roller |
        | eierfogd |
        | saksstatus |

```

## Arrow functions

Cucumber-js lager et javascript-objekt som de kaller World objektet. Dette objektet blir "this" variabelen i alle Given/When/Then funksjoner slik at kode/funksjoner kan dele data i et scenario gjennom World objektet.

Hvert scenario får sitt eget World objekt hvilket også betyr at data <i>ikke</i> kan deles mellom scenarier. Hvis man bruker arrow functions i Given/When/Then deklarasjonen så mister man tilgangen til World objektet (google it). Derfor må alle funksjoner bruke "gammel" måte som:

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

Om begge funksjonene kalles innefor samme scenario vil this.response være tilgjengelig for 'jeg sjekker resultat'.

## Kjøre fra utviklerimage
Den enkleste måten å kjøre testene i cucumber på er via Jenkins. For å teste lokalt før man eventuelt sjekker inn kode i prosjektet kan man kjøre tester fra utviklerimage ved å sette opp noen environment variabler før kjøring.

Sørg for at alle node moduler er lastet ned
```
$ cd bidrag-cucumber
$ npm install
```

Deretter kan man starte cucumber-js for å kjøre tester i feature-filene:
```
$ export fasit_user=<fasit username>
$ export PASSWORD=<fasit password>
$ export TEST_USER=<test username>
$ export TEST_PASS=<test password>
$ node_modules/cucumber/bin/cucumber-js --format json:cucumber_report.json cucumber/features/bidrag-cucumber.feature
```
Dette vil gi output til skjerm men også til filen 'cucumber_report.json' som man kan bruke til å generere en mer leselig HTML rapport. 


## HTML rapport

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
v
