package no.nav.bidrag.cucumber

import io.cucumber.java.en.Given
import io.cucumber.java.en.Then
import io.cucumber.java.en.When

open class StepDefs {

    private lateinit var stegForKilde: StepDefsForSource

    @Given("filsti for kildekode med stegdefinisjoner: {string}")
    fun `filsti for kildekode med stegdefinisjoner`(kildesti: String) {
        stegForKilde = StepDefsForSource(kildesti)
    }

    @When("man sjekker for duplikater")
    fun `man sjekker for duplikater`() {
        stegForKilde.finnDuplikater()
    }

    @Then("skal det ikke finnes duplikater")
    fun `skal det ikke finnes duplikater`() {
        stegForKilde.feilHvisDuplikater()
    }

    @Given("følgende feature-annotasjon blir lagt til: {string}")
    fun `folgende feature annotasjon blir lagt til`(featureAnnotasjon: String) {
        stegForKilde.leggTilDuplikat(featureAnnotasjon, this.javaClass.simpleName)
    }

    @Then("skal det finnes duplikater")
    fun `skal det finnes duplikater`() {
        stegForKilde.feilHvisIngenDuplikater()
    }
}
