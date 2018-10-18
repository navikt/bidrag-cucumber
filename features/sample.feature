Feature: Eksempel feature
    Beskrivelse av feature

    Scenario Outline: Dummy test
        Given given is <given>
        And surname is <surname>
        When I call compute-name
        Then I should have fullname <fullname>

        Examples:
            | given    | surname | fullname     |
            | "ola"    | "dunk"  | "ola dunk"   |
            | "john"   | "doe"   | "john doe"   |
