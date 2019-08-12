Feature: avvik bidrag-dokument-journalpost (/journalpost REST API)

    Tester REST API til journalpost endepunktet for avvik i bidrag-dokument.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokumentJournalpost'

    Scenario: Sjekk at kan bestille original
        When jeg kaller bestill original endpoint med journalpostID '34111047'
        Then resultatet skal være et objekt
        And statuskoden skal være '201'

    Scenario: Sjekk at kan bestille reskannning
        When jeg kaller bestill reskanning endpoint med journalpostID '34111047'
        Then resultatet skal være et objekt
        And statuskoden skal være '201'

    Scenario: Sjekk at kan ikke bestille ukjent avvik
        When jeg kaller bestill endpoint med avvik 'BLAH_BLAH_LAH_123' og journalpostID '34111047'
        Then statuskoden skal være '400'

    Scenario: Sjekk avviksvalg for gitt journalpost
        When jeg ber om avviksvalg for journalpostID '34111047'
        Then statuskoden skal være '200'
		And listen med valg skal kun inneholde:
		| BESTILL_ORIGINAL |
		| BESTILL_RESKANNING |
		| BESTILL_SPLITTING |
		| ENDRE_FAGOMRADE |
		| INNG_TIL_UTG_DOKUMENT |

