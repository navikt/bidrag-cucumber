Feature: bidrag-person

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit url og environment er gitt ved ENV variabler ved oppstart.
        Given restservice 'bidragPerson'

    Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then statuskoden skal være '200'
        And header 'content-type' skal være 'application/json;charset=UTF-8'
        And resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'

    Scenario: Sjekk at sylfest strutle fortsatt lever
        When jeg henter informasjon for ident '27067246654'
        Then statuskoden skal være '200'
