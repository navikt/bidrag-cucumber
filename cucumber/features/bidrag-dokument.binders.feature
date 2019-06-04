Feature: bidrag-dokument (/tilgang REST API)

    Tester tilgang URL

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
                Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragDokument'

    Scenario: Sjekk at vi får en gyldig URL for dokument tilgang for saksbehandler 
        When jeg ber om tilgang til dokument '30040789' for saksbehandler 'Z992346'
        Then statuskoden skal være '200'
