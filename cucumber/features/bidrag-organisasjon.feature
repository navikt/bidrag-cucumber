Feature: bidrag-organisasjon

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit url og environment er gitt ved ENV variabler ved oppstart.
        Given restservice 'bidragOrganisasjon'

    Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then statuskoden skal være '200'
        And header 'content-type' skal være 'application/json;charset=UTF-8'
        And resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'

    Scenario: Sjekk at gyldig saksbehandler-id returnerer OK (200) respons
        When jeg henter informasjon for ldap ident 'H153959'
        Then statuskoden skal være '200'

    Scenario: Sjekk at hent av enheter for saksbehandler-id returnerer OK (200) respons
        When jeg henter enheter for ident 'Z992022'
        Then statuskoden skal være '200'

