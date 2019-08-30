Feature: avvik bidrag-dokument-journalpost: feilfore sak

    Tester REST API til journalpost endepunktet for avvik i bidrag-dokument.

    Background: Lag/les journapost og sett felles params så vi slipper å gjenta for hvert scenario.
        Given restservice 'bidragDokumentJournalpost'
		And journalpostfil 'feilfore.json'
        And saksnummer '0000003'
        And les eller opprett journalpost
        """
        {
        "avsenderNavn": "Cucumber Test",
        "beskrivelse": "Test FEILFORE_SAK",
        "dokumentType": "I",
        "dokumentdato": "2019-01-01",
        "dokumentreferanse": "1234567890",
        "fagomrade": "BID",
        "gjelder": "29118044353",
        "journaldato": "2019-01-01",
        "journalforendeEnhet": "1289",
        "journalfortAv": "Behandler, Zakarias",
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
		And listen med valg skal inneholde 'FEILFORE_SAK'
#
#    Scenario: Sjekk at man kan feilfore sak
#        Given avvikstype 'FEILFORE_SAK'
#        When jeg kaller avvik endpoint
#        Then statuskoden skal være '200'
#
#    Scenario: Sjekk at avviksvalg for gitt journalpost ikke inneholder FEILFORE_SAK
#        When jeg ber om gyldige avviksvalg for journalpost
#        Then statuskoden skal være '200'
#		And listen med valg skal ikke inneholde 'FEILFORE_SAK'
#
#    Scenario: Sjekk at oppgave blir laget for bestill original
#        When jeg søker etter oppgaver for journalpost
#        Then statuskoden skal være '200'
