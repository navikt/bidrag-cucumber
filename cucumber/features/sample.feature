Feature: bidrag-dokument-cucumber fasit API

    Tester REST API til fasit og sjekker at vi får gyldig token

    Scenario: Sjekk at vi får et gyldig id_token i 'q0'
        When jeg ber om et token fra 'q0'
        Then skal token være gyldig
        And token skal ha følgende properties:
	    | aud | bidrag-dokument-ui-q0 |
	    | sub | bidrag-dokument-ui-q0 |
	    | tokenType | JWTToken |

    Scenario: Sjekk at vi får et gyldig id_token i 't0'
        When jeg ber om et token fra 't0'
        Then skal token være gyldig
        And token skal ha følgende properties:
	    | aud | bidrag-dokument-ui-t0 |
	    | sub | bidrag-dokument-ui-t0 |
	    | tokenType | JWTToken |

