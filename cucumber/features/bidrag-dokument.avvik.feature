Feature: avvik bidrag-dokument (/journalpost REST API)

    Tester REST API til journalpost endepunktet for avvik i bidrag-dokument.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokument'

    Scenario: Sjekk at kan bestille original
        When jeg kaller bestill original endpoint med journalpostID 'BID-34111047'
        Then resultatet skal være et objekt
        And statuskoden skal være '201'

    Scenario: Sjekk at kan bestille reskannning
        When jeg kaller bestill reskanning endpoint med journalpostID 'BID-34111047'
        Then resultatet skal være et objekt
        And statuskoden skal være '201'

    Scenario: Sjekk at kan ikke bestille ukjent avvik
        When jeg kaller bestill endpoint med avvik 'BLAH_BLAH_LAH_123' og journalpostID 'BID-34111047'
        Then statuskoden skal være '400'

