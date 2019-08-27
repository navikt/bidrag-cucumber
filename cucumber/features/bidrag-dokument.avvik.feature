Feature: avvik bidrag-dokument (/sak/*/journal/*/avvik REST API)

    Tester REST API til journalpost endepunktet for avvik i bidrag-dokument.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokument'
        And saksnummer '0000003'
        And journalpostID 'BID-34111047'
        And enhetsnummer '4806'

    Scenario: Reset journalpost data
        Given journalpostID '34111047'
        When jeg endrer journalpost til
            """
            {
                "fagomrade": "BID",
                "feilfort": "false",
                "dokumentType": "I",
                "originalBestilt": "false",
                "skannetDato": "2019-08-21"
            }
            """
        Then statuskoden skal være '202'

    Scenario: Sjekk avviksvalg for gitt journalpost
        When jeg ber om gyldige avviksvalg for journalpost
        Then statuskoden skal være '200'
        And listen med valg skal kun inneholde:
            | BESTILL_ORIGINAL |
            | BESTILL_RESKANNING |
            | BESTILL_SPLITTING |
            | ENDRE_FAGOMRADE |
            | INNG_TIL_UTG_DOKUMENT |
            | FEILFORE_SAK |

    Scenario: Sjekk at kan bestille original
        Given avvikstype 'BESTILL_ORIGINAL'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '201'

    Scenario: Sjekk at avviksvalg for gitt journalpost ikke inneholder BESTILL_ORIGINAL
        When jeg ber om gyldige avviksvalg for journalpost
        Then statuskoden skal være '200'
		And listen med valg skal ikke inneholde 'BESTILL_ORIGINAL'

    Scenario: Sjekk at kan bestille reskannning
        Given avvikstype 'BESTILL_RESKANNING'
        When jeg kaller avvik endpoint
        And statuskoden skal være '201'

    Scenario: Sjekk at kan ikke bestille ukjent avvik
        Given avvikstype 'BLAH_BLAH_LAH_123'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '400'

    Scenario: Sjekk at jeg kan bestille splitting
        Given avvikstype 'BESTILL_SPLITTING'
        And beskrivelse 'Splitt på midten'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '201'

    Scenario: Sjekk at jeg kan endre fagområde til FAR
        Given avvikstype 'ENDRE_FAGOMRADE'
        And beskrivelse 'FAR'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '200'

    Scenario: Sjekk at endring av fagområde feiler når vi prøver å endre fra FAR til FAR
        Given avvikstype 'ENDRE_FAGOMRADE'
        And beskrivelse 'FAR'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '400'

    Scenario: Sjekk at jeg kan endre fagområde tilbake til BID
        Given avvikstype 'ENDRE_FAGOMRADE'
        And beskrivelse 'BID'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '200'

    Scenario: Reset journalpost data
        Given journalpostID '34111047'
        When jeg endrer journalpost til
            """
            {
                "feilfort": "false"
            }
            """
        Then statuskoden skal være '202'

    Scenario: Sjekk at kan feilføre sak
        Given avvikstype 'FEILFORE_SAK'
        When jeg kaller avvik endpoint
        And statuskoden skal være '200'
