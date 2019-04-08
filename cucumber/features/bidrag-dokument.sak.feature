Feature: bidrag-dokument (/sakjournal REST API)

    Tester REST API til bidrag dokument ui.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
                Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokument'

    Scenario: Sjekk at vi får en liste med journalposter for en gitt sak
        When jeg henter journalposter for sak "0000003" med fagområde "BID"
        Then statuskoden skal være '200'
        And skal resultatet være en liste
        And hvert element i listen skal ha 'saksnummer' = '0000003'

    Scenario: Sjekk at vi får en journalpost for et farskap på gitt sak
        When jeg henter journalposter for sak "0603479" med fagområde "FAR"
        Then statuskoden skal være '200'
        And skal resultatet være en liste
        And hvert element i listen skal ha 'saksnummer' = '0603479'
        And hvert element i listen skal ha 'fagomrade' = 'FAR'

    Scenario: Sjekk at saksnummer som ikke er heltall gir HttpStatus 400 (Bad Request)
        When jeg henter journalposter for sak "XYZ" med fagområde "FAR"
        Then statuskoden skal være '400'

