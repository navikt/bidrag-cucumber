Feature: bidrag-cucumber fasit API

    Tester REST API til fasit og sjekker at vi får gyldig token

    Scenario: Sjekk at vi får et gyldig id_token i 'q0'
        When jeg ber om et token fra 'q0'
        Then skal token være gyldig
        And token skal ha følgende properties:
            | aud       | bidrag-dokument-ui-q0 |
            | sub       | bidrag-dokument-ui-q0 |
            | tokenType | JWTToken              |

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
