package no.nav.bidrag.cucumber

import io.cucumber.java.no.Når
import io.cucumber.java.no.Så
import org.assertj.core.api.Assertions.assertThat

class TestEgenskap {

    private lateinit var egenskapNavn: String

    @Når("jeg tester denne egenskapen")
    fun `jeg tester dene egenskapen`() {
        egenskapNavn = this.javaClass.simpleName
     }

    @Så("skal aktuell klasse være {string}")
    fun `skal aktuell klasse vaere`(forventetEgenskap: String) {
        assertThat(egenskapNavn).isEqualTo(forventetEgenskap)
    }
}
