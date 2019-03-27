# bidrag-cucumber

bidrag-dokument-cucumber (https://github.com/navikt/bidrag-cucumber) er et node prosjekt som inneholder cucumber-js runtime samt scripts for å gjøre REST API kall via fasit REST ressurser. Dette prosjektet inneholder også alle cucumber features og step definitions (fixture code) for alle bidrag mikrotjenester. Dette prosjektet kjører cucumber testene for mikrotjenestene som en del av Jenkins pipeline (bidrag-jenkins).

Sentralt i cucumber oppsettet er fasit modulen (bidrag-cucumber/fasit/index.js) som har kode for følgende:

* Gjøre oppslag mot fasit.adeo.no for å finne URL, passord etc til navngitte tjenester (e.g. bidragDokumentUi)
* Skaffe id-token for miljøet det kjøres i
* Tilby forenklet http get, put, delete og post hvor man kun oppgir tjeneste og miljø

Fasit modulen benytter seg av følgende environment variabler for å fungere:

| ENV         | Default | Beskrivelse |
| ----------- | ------- | ----------- |
| fasit_user	| | Brukernavn med rettigheter til å lese passord for bisys ressurser |
| fasit_pass	| | Passord for fasit_user |
| test_user	  | | Brukernavn testene skal kjøres på vegne av (e.g Z990503). Testbruker kan lages i https://ida.adeo.no og må lages i henhold til [ABAC klartekstpolicies for domene "bidrag"](https://confluence.adeo.no/pages/viewpage.action?pageId=309322099) |
| test_pass	  |    |Passord for test_user |
| environment	| q0 |Fasit miljø det hentes ressurser fra |
| fasit_url	  | https://fasit.adeo.no/api/v2/resources	| URL til fasit |
| oidc_alias	| bidrag-dokument-ui-oidc	| Fasit-ressurs for OIDC detaljer |

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

I "feature" katalogen legges feature testene og i "step_definitions" legges javascript kode som benyttes i testene. Les mer om cucumber på https://docs.cucumber.io

I stepdefs.js bør man inkludere fasit fra bidrag-cucumber. Fasit scriptet gjør det enkelt å kalle en REST tjeneste ved hjelp av en fasit alias og miljø. Sjekk javascript ressursene for funksjoner slik at vi ikke ender opp med varianter/duplikater.  Er koden av generell interesse bør den lagres i shared.js. Ellers er navngivingen av filer i step_definitions kun underlagt sunn fornuft.

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
               Fasit environment er gitt ved environment variabler ved oppstart.
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
       | saksnummer |
       | saksstatus |
       
```
## Fat-arrow functions
Cucumber-js lager et javascript-objekt som de kaller World objektet. Dette objektet blir "this" i alle Given/When/Then funksjoner slik at kode/funksjoner kan dele data i et scenario. Hvert scenario for sitt eget World objekt. Hvis man bruker fat-arrow i Given/When/Then funksjonene så mister man tilgangen til World objektet (google it). Derfor bør alle funksjoner bruke "gammel" måte som:

```
When('jeg ringer hjem', function() {
})
```
og ikke
```
When('jeg ringer hjem', () => {
})
```

Inne i selve funksjonen kan (og bør) man bruke fat-arrow slik at "this" alltid peker til World:
```
When('jeg ringer hjem', function(done) {
     httpGet(this.alias, this.env, '/suffix').then ( response => {
          this.response = response         // <--- this peker til world
          done()                                      // <--- forteller cucumber vi er klare til neste steg i scenario
     })
})

When('jeg sjekker resultat', function() {
      console.log(this.response)          // <--- this peker til World 
})
```

Om begge funksjonene kalles innefor samme scenario vil this.response være tilgjengelig for 'jeg sjekker resultat'.

## bidrag-cucumber image

Bygg image med følgende
```
$ npm install
$ docker build -t bidrag-cucumber .
```

bidrag-cucumber kjøres med å definere påkrevede ENV variabler samt å linke inn /cucumber katalog hvor imaget forventer å finne features katalogen med tester.

```
$ git clone https://github.com/navikt/bidrag-cucumber.git .
$ docker run --rm -e environment=q0 \
    -e fasit_user=<fasitUser> \
    -e fasit_pass=<fasitPass> \
    -e test_user=<testUser>
    -e test_pass=<testPass> \
    -e project="<mikrotjeneste>." \
    -v $(pwd)/cucumber:/cucumber bidrag-cucumber
$ docker run -it --rm -v `pwd`/cucumber:/cucumber bidrag-cucumber
```


