Feature: bidrag-dokument-testdata

    Tester REST API til endepunkt i bidrag-dokument-testdata.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokumentTestdata'

    Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then statuskoden skal være '200'
        And header 'content-type' skal være 'application/json;charset=UTF-8'
        And resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'

    # Scenario: Lag ny journalpost
    #     When jeg lager ny journalpost
    #         """
    #         {
    #             "avsenderNavn": "Cucumber, Test",
    #             "beskrivelse": "Søknad, Bidrag",
    #             "dokumentdato": "2019-01-01",
    #             "dokumentreferanse": "121603000163",
    #             "dokumentType": "I",
    #             "journalforendeEnhet": "1216",
    #             "journalfortAv": "Laget av bidrag-dokument-testdata cucumber test",
    #             "journaldato": "2019-01-01",
    #             "mottattdato": "2019-01-01",
    #             "saksnummer": "0000003",
    #             "fagomrade": "BID"
    #         }
    #         """
    #     Then statuskoden skal være '201'
