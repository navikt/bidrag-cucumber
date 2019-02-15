Feature: bidrag-journalpost /journalpost REST API

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit url og environment er gitt ved ENV variabler ved oppstart.
        Given restservice 'bidragDokumentJournalpost'

    Scenario: Sjekk at vi får en journalpost for en gitt journalpostId
        When jeg henter journalpost for id "19650256" via dokument-journalpost
        Then statuskoden skal være '200'
        And resultatet skal være et objekt
        And objektet skal ha følgende properties:
            | avsenderNavn      |
            | dokumentDato      |
            | dokumenter        |
        And journalposten sitt dokument skal ha følgende properties:
            | dokumentreferanse |
            | dokumentType      |

    Scenario: Sjekk at ukjent id gir 204
        When jeg henter journalpost for id "12345"
        Then statuskoden skal være '204'

    Scenario: Sjekk at id som feil type gir 400
        When jeg henter journalpost for id "abcd"
        Then statuskoden skal være '400'
