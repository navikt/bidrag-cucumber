Feature: bidrag-dokument (/journalposter REST API)

    Tester REST API til journalpost endepunktet i bidrag-dokument.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
                Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokument'

    Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'
        And statuskoden skal være '200'

    Scenario: Sjekk at vi får en sakjournal på sak/fagområdet
        When jeg henter journalposter for sak "0000003" med fagområde "BID"
        Then statuskoden skal være '200'
        And skal resultatet være en liste
        And hvert element i listen skal ha 'saksnummer' = '0000003'
        And hvert element i listen skal ha 'fagomrade' = 'BID'

    Scenario: Sjekk innholdet av en enkelt journalpost i bidrag
        When jeg henter journalposter for sak "0000003" med fagområde "BID"
        Then statuskoden skal være '200'
        And skal resultatet være en liste
        And hvert element i listen skal ha følgende properties satt:
            | fagomrade   |
            | dokumenter  |
            | saksnummer  |

    Scenario: Sjekk at ukjent sak gir 204 med ingen data
        When jeg henter journalposter for sak "XYZ" med fagområde "BID"
        Then statuskoden skal være '204'


    Scenario: Sjekk at journalpost kan oppdateres - James Bond
        When jeg endrer journalpost 'BID-30040789' til:
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
            "avsenderNavn": "Bond, James",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09"
        }
        """
        Then statuskoden skal være '202'
        And objektet skal ha 'avsenderNavn' = 'Bond, James'

    Scenario: Sjekk at journalpost kan oppdateres - Trygdekontoret
        When jeg endrer journalpost 'BID-30040789' til:
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
            "avsenderNavn": "Trygdekontoret",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09"
        }
        """
        Then statuskoden skal være '202'
        And objektet skal ha 'avsenderNavn' = 'Trygdekontoret'
