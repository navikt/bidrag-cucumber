Feature: bidrag-cucumber

  Tester REST API til fasit og sjekker at vi får gyldig token

  Scenario: Sjekk duplikater i fixture kode (StepDefs.kt)
    Given filsti for kildekode med stegdefinisjoner: 'src/test/kotlin/no/nav/bidrag/cucumber'
    When man sjekker for duplikater
    Then skal det ikke finnes duplikater

  Scenario: Sjekk at duplikater i fixture kode (StepDefs.kt) blir funnet
    Given filsti for kildekode med stegdefinisjoner: 'src/test/kotlin/no/nav/bidrag/cucumber'
    And følgende feature-annotasjon blir lagt til: '@Then("skal det ikke finnes duplikater")'
    When man sjekker for duplikater
    Then skal det finnes duplikater
