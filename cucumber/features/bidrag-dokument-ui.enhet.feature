Feature: bidrag-dokument-ui.enhet

    Tester REST API til bidrag dokument ui for uthenting av enhetsinfo fra Norg2.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
                Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokumentUi'

    Scenario: Sjekk at vi finner en enhet med et gitt enhetsnr
        When jeg henter enhet med enhetnr "1630" via dokument-ui
        Then statuskoden skal være '200'
        And resultatet skal være et objekt
        And objektet skal ha 'navn' = 'NAV Nord-Fosen'

    Scenario: Sjekk at ukjent enhet gir 204 med ingen data
        When jeg henter enhet med enhetnr "1630X" via dokument-ui
        Then statuskoden skal være '404'