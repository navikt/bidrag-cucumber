package no.nav.bidrag.cucumber

import org.assertj.core.api.Assertions.assertThat
import java.io.File

internal class StepDefsForSource(
        private val sourceFolder: File
) {
    private var stegdefinisjonerFraKilde: MutableList<File> = ArrayList()
    private var alleAnnotasjoner: MutableMap<String, MutableList<FeatureAnnotation>> = HashMap()

    constructor(sourcePath: String) : this(File(sourcePath))

    internal fun finnDuplikater() {
        les(sourceFolder)
        assertThat(stegdefinisjonerFraKilde).withFailMessage("stegdefinisjoner fra kildemappe").isNotEmpty
        stegdefinisjonerFraKilde.forEach { finnDupliserteAnnotasjoner(it) }
    }

    private fun les(mappe: File) {
        val mappensFiler = mappe.listFiles { _, name -> name.endsWith(".kt") }

        assertThat<File>(mappensFiler).`as`("Filer i kilde: " + mappe.absolutePath).isNotNull

        for (kildefil in mappensFiler!!) {
            if (kildefil.isDirectory) {
                les(kildefil)
            } else {
                stegdefinisjonerFraKilde.add(kildefil)
            }
        }
    }

    private fun finnDupliserteAnnotasjoner(stegdefinisjon: File) {
        stegdefinisjon.forEachLine { taVarePaFeatureAnnotasjon(it, stegdefinisjon.absolutePath) }
    }

    private fun taVarePaFeatureAnnotasjon(linje: String, fraKildefil: String) {
        val linjeTrimmed = linje.trim()

        if (linjeTrimmed.startsWith("@Given") || linjeTrimmed.startsWith("@When") || linjeTrimmed.startsWith("@Then")) {
            alleAnnotasjoner.getOrPut(linjeTrimmed) { mutableListOf() }.add(FeatureAnnotation(linjeTrimmed, fraKildefil))
        }
    }

    internal fun feilHvisDuplikater() {
        val duplikater = hentDuplikater()

        assertThat(duplikater).withFailMessage("Duplikater: %s", duplikater).isEmpty()
    }

    private fun hentDuplikater(): List<FeatureAnnotation> {
        val duplikater = mutableListOf<FeatureAnnotation>()

        alleAnnotasjoner.forEach { annotasjon, listeAvTilfeller -> leggTilDuplikater(listeAvTilfeller, duplikater) }

        return duplikater
    }

    private fun leggTilDuplikater(listeAvTilfeller: MutableList<FeatureAnnotation>, duplikater: MutableList<FeatureAnnotation>) {
        if (listeAvTilfeller.size > 1) {
            duplikater.addAll(listeAvTilfeller)
        }
    }

    internal fun leggTilDuplikat(featureAnnotasjon: String, simpleName: String?) {
        alleAnnotasjoner.getOrPut(featureAnnotasjon) { mutableListOf() }
                .add(FeatureAnnotation(featureAnnotasjon, simpleName ?: "StepDefsForSource.kt"))
    }

    internal fun feilHvisIngenDuplikater() {
        val duplikater = hentDuplikater()

        assertThat(duplikater).withFailMessage("ingen duplikater").isNotEmpty
    }

    private data class FeatureAnnotation(
            private val annotationText: String,
            private var kildeSti: String
    )
}