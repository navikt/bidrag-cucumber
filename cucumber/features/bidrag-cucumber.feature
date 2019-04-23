Feature: bidrag-cucumber

    Tester REST API til fasit og sjekker at vi får gyldig token

    Scenario: Test shared funksjoner
        When response er
            """
            {
            "avsenderNavn": "NN, NN",
            "dokumenter": [
            {
            "dokumentreferanse": "121603000163",
            "dokumentType": "U",
            "tittel": "tittel"
            }
            ],
            "dokumentDato": "2003-01-31",
            "fagomrade": "BID",
            "gjelderAktor": null,
            "innhold": "OMREGNING BIDRAG / INFORMASJONSBREV",
            "journalforendeEnhet": "1216",
            "journalfortAv": "Konvertert fra BOST",
            "journalfortDato": "2003-01-31",
            "journalpostId": "BID-19650256",
            "mottattDato": "2003-01-31",
            "saksnummer": "0000003",
            "dokumentType": "U",
            "journalstatus": "A"
            }
            """
        Then objektet skal ha følgende properties:
            | avsenderNavn |  |
            | dokumenter   |  |
        And 'dokumenter' skal ha følgende properties:
            | dokumentreferanse | 121603000163 |
            | dokumentType      | U            |
            | tittel            | tittel       |

    Scenario: Test shared funksjoner
        When response er
            """
            [
            {
            "avsenderNavn": "Nordlandssykehuset",
            "dokumenter": [
            {
            "dokumentreferanse": "3000795204",
            "dokumentType": "I",
            "tittel": ""
            }
            ],
            "dokumentDato": "2006-03-27",
            "fagomrade": "FAR",
            "gjelderAktor": {
            "ident": "10106948203",
            "identType": "",
            "aktorType": "person"
            },
            "innhold": "Fødselsmelding, Farskap",
            "journalforendeEnhet": "1840",
            "journalfortAv": "Bjørn Skog",
            "journalfortDato": "2006-03-29",
            "journalpostId": "BID-30007952",
            "mottattDato": "2006-03-29",
            "saksnummer": "0603479",
            "bidragssaker": [],
            "dokumentType": "I",
            "journalstatus": "J"
            }
            ]
            """
        Then 'gjelderAktor' i hvert element skal ha følgende properties:
            | ident     |
            | identType |
            | aktorType |


    Scenario: Sjekk at vi får et gyldig id_token i 'q0'
        When jeg ber om et token fra 'q0'
        Then skal token være gyldig
        And token skal ha følgende properties:
            | aud       | bidrag-dokument-ui-q0 |
            | sub       | bidrag-dokument-ui-q0 |
            | tokenType | JWTToken              |

    Scenario: Sjekk at vi får et gyldig id_token i 'q0' for testbruker
        When jeg ber om et bruker-token fra 'q0'
        Then skal token være gyldig
        And token skal ha følgende properties:
            | aud       | bidrag-dokument-ui-q0  |
            | sub       | $process.env.test_user |
            | tokenType | JWTToken               |

    Scenario: Sjekk at vi får et gyldig id_token i 'q1'
        When jeg ber om et token fra 'q1'
        Then skal token være gyldig
        And token skal ha følgende properties:
            | aud       | bidrag-dokument-ui-q1 |
            | sub       | bidrag-dokument-ui-q1 |
            | tokenType | JWTToken              |

    Scenario: Sjekk at vi får et gyldig id_token i 'q4'
        When jeg ber om et token fra 'q4'
        Then skal token være gyldig
        And token skal ha følgende properties:
            | aud       | bidrag-dokument-ui-q4 |
            | sub       | bidrag-dokument-ui-q4 |
            | tokenType | JWTToken              |

    Scenario: Sjekk duplikater i fixture kode
        Given cucumber fixtures in 'cucumber/features/step_definitions'
        When validating cucumber fixtures
        Then there should be no duplicates

    Scenario: Sjekk at duplikater i fixture kode blir funnet
        Given cucumber fixtures in 'cucumber/features/step_definitions'
        And adding the following fixture to 'duplicate1.js':
            """
        const { When } = require('cucumber');
        When('skal token være gyldig', function () {
            })
            """
        When validating cucumber fixtures
        Then there should be duplicates
