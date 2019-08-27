Feature: avvik bidrag-dokument-journalpost: bestill splitting

    Background: Lag/les journapost og sett felles params så vi slipper å gjenta for hvert scenario.
        Given restservice 'bidragDokumentJournalpost'
		And journalpostfil 'splitting.json'
        And saksnummer '0000003'
        And les eller opprett journalpost
        """
        {
        "avsenderNavn": "Cucumber Test",
        "batchNavn": "En batch",
        "beskrivelse": "Test bestill splitting",
        "dokumentType": "I",
        "dokumentdato": "2019-01-01",
        "dokumentreferanse": "1234567890",
        "fagomrade": "BID",
        "filnavn": "svada.pdf",
        "gjelder": "29118044353",
        "journaldato": "2019-01-01",
        "journalforendeEnhet": "1289",
        "journalfortAv": "Behandler, Zakarias",
        "mottattDato": "2019-01-01",
        "saksnummer": "0000003",
        "skannetDato": "2019-01-01",
        "filnavn": "svada.pdf"
        }
        """
        Then statuskoden skal være '201'
		And sett 'journalpostid' til journalpost.'journalpostId'
        And enhetsnummer '4806'

    Scenario: Sjekk avviksvalg for gitt journalpost
        When jeg ber om gyldige avviksvalg for journalpost
        Then statuskoden skal være '200'
		And listen med valg skal inneholde 'BESTILL_SPLITTING'

    Scenario: Sjekk at jeg kan bestille splitting
        Given avvikstype 'BESTILL_SPLITTING'
        And beskrivelse 'Splitt på midten'
        When jeg kaller avvik endpoint
        Then statuskoden skal være '201'

  Scenario: Sjekk at oppgave blir laget for splitting
        When jeg søker etter oppgaver for journalpost
        Then statuskoden skal være '200'


