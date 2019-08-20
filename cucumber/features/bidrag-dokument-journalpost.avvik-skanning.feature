Feature: avvik bidrag-dokument-journalpost: reskanning

    Tester REST API til journalpost endepunktet for avvik i bidrag-dokument.

    Background: Lag/les journapost og sett felles params så vi slipper å gjenta for hvert scenario.
        Given restservice 'bidragDokumentJournalpost'
		And journalpostfil 'skanning.json'
        And les eller opprett journalpost
        """
        {
        "avsenderNavn": "Cucumber Test",
        "beskrivelse": "Test reskanning",
        "dokumentType": "I",
        "dokumentdato": "2019-01-01",
        "dokumentreferanse": "string",
        "fagomrade": "BID",
        "gjelder": "29118044353",
        "journaldato": "2019-01-01",
        "journalforendeEnhet": "1289",
        "journalfortAv": "Behandler, Zakarias",
        "journalstatus": "J",
        "mottattDato": "2019-01-01",
        "skannetDato": "2019-01-01",
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

    Scenario: Sjekk at reskanning kan bestilles
        Given avvikstype 'BESTILL_RESKANNING'
        When jeg kaller avvik endpoint
        And statuskoden skal være '201'

    Scenario: Sjekk at oppgave blir laget for reskanning
        When jeg søker etter oppgaver for journalpost
        Then statuskoden skal være '200'

