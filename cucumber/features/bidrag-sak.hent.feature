Feature: bidrag-sak

    Tester REST API til endepunktet BidragSakController i bidrag-sak.
    URLer til tjenester hentes via fasit.adeo.no og gjøres ved å spesifisere
    alias til en RestService record i fasit for et gitt miljø.

    Background: Spesifiser base-url til tjenesten her så vi slipper å gjenta for hvert scenario.
        Fasit environment er gitt ved environment variabler ved oppstart.
        Given restservice 'bidragSak'

    Scenario: Sjekk at health endpoint er operativt
        When jeg kaller status endpoint
        Then statuskoden skal være '200'
        And header 'content-type' skal være 'application/json;charset=UTF-8'
        And resultatet skal være et objekt
        And objektet skal ha 'status' = 'UP'

    Scenario: Sjekk at vi får bidragssaker som involverer person angitt
        When jeg henter bidragssaker for person med fnr "10099447805"
        Then statuskoden skal være '200'
        And hvert element i listen skal ha følgende properties satt:
            | roller     |
            | eierfogd   |
            | saksnummer |
            | saksstatus |
            | kategori   |
