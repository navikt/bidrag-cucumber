Feature: bidrag-dokument-journalpost

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit url og environment er gitt ved ENV variabler ved oppstart.
        Given restservice 'bidragDokumentJournalpost'

    Scenario: Sjekk at vi får en journalpost for en gitt journalpostId
        When jeg henter journalpost for id "19650256"
        Then statuskoden skal være '200'
        And resultatet skal være et objekt
        And objektet skal ha følgende properties:
            | avsenderNavn      |
            | dokumentDato      |
            | dokumenter        |
        And journalposten sitt dokument skal ha følgende properties:
            | dokumentreferanse |
            | dokumentType      |

    Scenario: Sjekk at vi får en sakjournal for sak/fagområde
        When jeg henter journalposter for sak "0000003" med fagområde "BID"
        Then statuskoden skal være '200'
        And skal resultatet være en liste
        And hvert element i listen skal ha 'saksnummer' = '0000003'
        And hvert element i listen skal ha 'fagomrade' = 'BID'

    Scenario: Sjekk at ukjent id gir 204
        When jeg henter journalpost for id "12345"
        Then statuskoden skal være '204'

    Scenario: Sjekk at id som feil type gir 400
        When jeg henter journalpost for id "abcd"
        Then statuskoden skal være '400'

    Scenario: Sjekk at journalpost kan oppdateres - Vinterfred
        When jeg endrer journalpost '30040789' til:
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
            "avsenderEtternavn": "Vinterfred",
            "avsenderFornavn": "Vinterfred",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09"
        }
        """
        Then statuskoden skal være '202'
        And objektet skal ha 'avsenderNavn' = 'Vinterfred, Vinterfred'

    Scenario: Sjekk at journalpost kan oppdateres - Sommervold
        When jeg endrer journalpost '30040789' til:
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
            "avsenderEtternavn": "Sommervold",
            "avsenderFornavn": "Sommervold",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09"
        }
        """
        Then statuskoden skal være '202'
        And objektet skal ha 'avsenderNavn' = 'Sommervold, Sommervold'
