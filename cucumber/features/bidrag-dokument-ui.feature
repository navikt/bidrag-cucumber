Feature: bidrag-dokument-ui

    Tester REST API til bidrag dokument ui.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
                Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokumentUi'

    Scenario: Sjekk at vi får en liste med journalposter for en gitt sak
        When jeg henter journalposter for sak "0000003" med fagområde 'BID' via dokument-ui
        Then statuskoden skal være '200'
        And skal resultatet være en liste

    Scenario: Sjekk at ukjent sak gir 204 med ingen data
        When jeg henter journalposter for sak "0000000" med fagområde 'BID' via dokument-ui
        Then statuskoden skal være '204'

    Scenario: Sjekk at journalpost kan oppdateres - Dolfern Lundgren
        When jeg endrer journalpost 'BID-30040789' for sak '0000004' via dokument-ui til:
        """
        {
            "journalpostId": 30040789,
            "saksnummer": {
                "erTilknyttetNySak": false,
                "saksnummer": "0000004",
                "saksnummerSomSkalErstattes":
                "0000004"
            },
            "gjelder": "29118044353",
            "avsenderNavn": "Lundgren, Dolfern",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09"
        }
        """
        Then statuskoden skal være '202'
        And objektet skal ha 'avsenderNavn' = 'Lundgren, Dolfern'

    Scenario: Sjekk at journalpost kan oppdateres - Jon Blund
        When jeg endrer journalpost 'BID-30040789' for sak '0000004' via dokument-ui til:
        """
        {
            "journalpostId": 30040789,
            "saksnummer": {
                "erTilknyttetNySak": false,
                "saksnummer": "0000004",
                "saksnummerSomSkalErstattes":
                "0000004"
            },
            "gjelder": "29118044353",
            "avsenderNavn": "Blund, Jon",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09"
        }
        """
        Then statuskoden skal være '202'
        And objektet skal ha 'avsenderNavn' = 'Blund, Jon'