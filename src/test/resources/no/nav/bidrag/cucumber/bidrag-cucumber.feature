# language: no
@bidrag-cucumber
Egenskap: bidrag-cucumber
  Sjekker fixture-kode for duplikater

  Scenario: Sjekk om det finnes duplikater i fixture kode
    Gitt filsti til kildekode: 'src/test/kotlin/no/nav/bidrag/cucumber'
    Når man sjekker for duplikater
    Så skal det ikke finnes duplikater

  Scenario: Sjekk at duplikater i fixture kode blir funnet
    Gitt filsti til kildekode: 'src/test/kotlin/no/nav/bidrag/cucumber'
    Og fixture-annotasjon blir lagt til: '@Så("skal det ikke finnes duplikater")'
    Når man sjekker for duplikater
    Så skal det finnes duplikater

  Scenario: Finn egenskap fra classpath
    Gitt jeg tester denne egenskapen
    Så skal aktuell klasse være "TestEgenskap"
