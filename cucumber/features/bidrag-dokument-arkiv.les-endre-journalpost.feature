Feature: bidrag-dokument-arkiv - les/endre journalpost

    Background: Spesifiser base-url til tjenesten, filnavn, samt saksnummer
        som opereres p+ her så vi slipper å gjenta for hvert scenario.
        Fasit url og environment er gitt ved ENV variabler ved oppstart.
        Given restservice 'bidragDokumentArkiv'
        And journalpostfil 'joark-journal.json'
        And saksnummer '1900001'
        And les eller opprett journalpost med journalpost-api
        """
        {
        "avsenderMottaker": {"navn":"Birger"},
        "behandlingstema": "",
        "bruker": {"id": 06127412345, "idType":"FNR"},
        "dokumenter": "[{ "brevkode": "BREVKODEN", "dokumentKategori":"KATEGORI", "tittel": "Tittelen på dokumentet" }],
        "eksternReferanseId": "dokumentreferanse",
        "journalfoerendeEnhet": "1234",
        "journalpostType": "N",
        "kanal": "nav.no",
        "sak": { "arkivsaksnummer": "1900001", "arkivsaksystem": "GSAK" },
        "tema": "BID",
        "tittel": "Tittelen på journalposten"
        }
        """

    Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then statuskoden skal være '200'
        And header 'content-type' skal være 'application/json;charset=UTF-8'
        And resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'
