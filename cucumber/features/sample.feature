Feature: bidrag-dokument-cucumber fasit API

    Tester REST API til journalpost endepunktet i bidrag-dokument.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Given restservice 'bidragJournalpost' i 'q0'

    Scenario: Sjekk at vi får et gyldig id_token i 'q0'
        When jeg ber om et token fra 'q0'
        Then statuskoden skal være '201'

