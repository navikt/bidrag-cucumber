package no.nav.bidrag.cucumber

import io.cucumber.java.no.Gitt
import io.cucumber.java.no.Når
import io.cucumber.java.no.Så
import org.assertj.core.api.Assertions.assertThat

class BidragCucumberEgenskap {

    private lateinit var fixturesFraKildekode: FixturesFraKildekode

    @Gitt("filsti til kildekode: {string}")
    fun `filsti for kildekode med stegdefinisjoner`(kildesti: String) {
        fixturesFraKildekode = FixturesFraKildekode(kildesti)
    }

    @Når("man sjekker for duplikater")
    fun `man sjekker for duplikater`() {
        fixturesFraKildekode.finnDuplikater()
    }

    @Så("skal det ikke finnes duplikater")
    fun `skal det ikke finnes duplikater`() {
        val duplikater = fixturesFraKildekode.hentDuplikater()

        assertThat(duplikater).withFailMessage("Duplikater: %s", duplikater.joinToString("\n\t\t", "\n\t\t")).isEmpty()
    }

    @Gitt("fixture-annotasjon blir lagt til: {string}")
    fun `folgende fixture annotasjon blir lagt til`(fixtureAnnotasjon: String) {
        fixturesFraKildekode.leggTilDuplikat(fixtureAnnotasjon, this.javaClass.name)
    }

    @Så("skal det finnes duplikater")
    fun `skal det finnes duplikater`() {
        val duplikater = fixturesFraKildekode.hentDuplikater()

        assertThat(duplikater).withFailMessage("ingen duplikater").isNotEmpty
    }
}
