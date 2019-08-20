Feature: avvik bidrag-dokument-journalpost: endre fagomrade

    Background: Lag/les journapost og sett felles params så vi slipper å gjenta for hvert scenario.
        Given restservice 'bidragDokumentJournalpost'
		And journalpostfil 'fagomrade.json'
        And les eller opprett journalpost
        """
        {
        "avsenderNavn": "Cucumber Test",
        "beskrivelse": "Test bestill original",
        "dokumentType": "I",
        "dokumentdato": "2019-01-01",
        "dokumentreferanse": "1234567890",
        "fagomrade": "BID",
        "gjelder": "29118044353",
        "journaldato": "2019-01-01",
        "journalforendeEnhet": "1289",
        "journalfortAv": "Behandler, Zakarias",
        "journalstatus": "J",
        "mottattDato": "2019-01-01",
        "saksnummer": "0000003"
        }
        """
        Then statuskoden skal være '201'
		And sett 'journalpostid' til journalpost.'journalpostId'
        And enhetsnummer '4806'

    Scenario: Sjekk avviksvalg for gitt journalpost
        When jeg ber om gyldige avviksvalg for journalpost
        Then statuskoden skal være '200'
		And listen med valg skal kun inneholde:
		| BESTILL_ORIGINAL |
		| BESTILL_RESKANNING |
		| BESTILL_SPLITTING |
		| ENDRE_FAGOMRADE |
		| INNG_TIL_UTG_DOKUMENT |

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

