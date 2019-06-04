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

    Scenario: Sjekk at vi får en sakjournal for en sak
        When jeg henter journalposter for sak "0000003" med fagområde "BID"
        Then statuskoden skal være '200'
        And skal resultatet være en liste
        And hvert element i listen skal ha følgende properties satt:
            | fagomrade    |
            | dokumenter   |
            | dokumentDato |

    Scenario: Sjekk at vi får korrekt basisinnhold journalpost for en gitt journalpostId
        When jeg henter journalpost for id "BID-19650256"
        Then statuskoden skal være '200'
        And resultatet skal være et objekt
        And objektet skal ha følgende properties:
            | avsenderNavn  |
            | dokumentDato  |
            | dokumentType  |
            | journalstatus |
            | journalfortAv |
            | innhold       |

    Scenario: Sjekk at sak uten tall gir HttpStatus 400 - Bad Request
        When jeg henter journalposter for sak "XYZ" med fagområde "BID"
        Then statuskoden skal være '400'


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

    Scenario: Sjekk at dokumentDato kan oppdateres til 2001-01-01
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
            "avsenderNavn": "Bær, Bjarne",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09",
            "dokumentDato": "2001-01-01"
            }
            """
        Then statuskoden skal være '202'
        And objektet skal ha 'dokumentDato' = '2001-01-01'

    Scenario: Sjekk at dokumentDator kan oppdateres til 2001-02-01
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
            "avsenderNavn": "Bær, Bjarne",
            "beskrivelse": "Søknad, Bidrag",
            "journaldato": "2006-05-09",
            "dokumentDato": "2001-02-01"
            }
            """
        Then statuskoden skal være '202'
        And objektet skal ha 'dokumentDato' = '2001-02-01'

