package no.nav.bidrag.cucumber

import io.cucumber.java.no.Gitt
import io.cucumber.java.no.Når
import io.cucumber.java.no.Så

open class StepDefs {

    private lateinit var stegForKilde: StepDefsForSource

    @Gitt("filsti til kildekode: {string}")
    fun `filsti for kildekode med stegdefinisjoner`(kildesti: String) {
        stegForKilde = StepDefsForSource(kildesti)
    }

    @Når("man sjekker for duplikater")
    fun `man sjekker for duplikater`() {
        stegForKilde.finnDuplikater()
    }

    @Så("skal det ikke finnes duplikater")
    fun `skal det ikke finnes duplikater`() {
        stegForKilde.feilHvisDuplikater()
    }

    @Gitt("fixture-annotasjon blir lagt til: {string}")
    fun `folgende feature annotasjon blir lagt til`(featureAnnotasjon: String) {
        stegForKilde.leggTilDuplikat(featureAnnotasjon, this.javaClass.simpleName)
    }

    @Så("skal det finnes duplikater")
    fun `skal det finnes duplikater`() {
        stegForKilde.feilHvisIngenDuplikater()
    }
}
