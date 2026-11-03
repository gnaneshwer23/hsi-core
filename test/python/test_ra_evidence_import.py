"""Parser fixtures only. TEST-* identities and non-biomedical text cannot form a production release."""
import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location("ra_import", Path(__file__).resolve().parents[2] / "tools/import_ra_evidence.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
EXPECTED = {"pmid": "TEST-PMID", "pmcid": "TEST-PMC", "doi": "TEST-DOI"}
XML = b'''<article article-type="research-article" xmlns:xlink="http://www.w3.org/1999/xlink"><front><article-meta>
<article-id pub-id-type="pmid">TEST-PMID</article-id><article-id pub-id-type="pmc">TEST-PMC</article-id><article-id pub-id-type="doi">TEST-DOI</article-id>
<title-group><article-title>Parser fixture, not a scientific publication</article-title></title-group>
<contrib-group><contrib contrib-type="author"><name><surname>Fixture</surname><given-names>Author</given-names></name></contrib></contrib-group>
<permissions><license xlink:href="https://creativecommons.org/licenses/by/4.0/"><license-p>Fixture permission notice.</license-p></license></permissions>
<abstract><sec><title>Results</title><p>First <italic>fixture</italic> paragraph. No biological findings.</p></sec><sec><title>Conclusions</title><p>Second fixture paragraph, for source-trace tests only.</p></sec></abstract>
</article-meta></front><back><ref-list><ref><mixed-citation><pub-id pub-id-type="pmid">NOT-THE-ARTICLE</pub-id></mixed-citation></ref></ref-list></back></article>'''

class ImportTests(unittest.TestCase):
    def test_exact_abstract_text_and_locators_with_attribution(self):
        result = module.article(XML, EXPECTED)
        self.assertEqual(result["passages"][0]["text"], "First fixture paragraph. No biological findings.")
        self.assertIn("abstract[1]/sec[1]/p[1]", result["passages"][0]["locator"])
        self.assertEqual(result["authors"], ["Fixture Author"])
        self.assertEqual(len(result["passages"]), 2)
    def test_restrictive_and_ambiguous_licences_fail(self):
        for uri in ["https://creativecommons.org/licenses/by-nc/4.0/", "https://creativecommons.org/licenses/by-nd/4.0/", "https://example.org/cc-by", "https://creativecommons.org/licenses/by/4.0/?different=terms", ""]:
            with self.subTest(uri=uri), self.assertRaises(ValueError): module.article(XML.replace(b"https://creativecommons.org/licenses/by/4.0/", uri.encode()), EXPECTED)
    def test_metadata_not_article_references_supply_identity(self):
        with self.assertRaises(ValueError): module.article(XML.replace(b">TEST-PMID<", b">WRONG<"), EXPECTED)
        self.assertNotEqual(module.article(XML, EXPECTED)["title"], "NOT-THE-ARTICLE")
    def test_duplicated_identity_is_ambiguous(self):
        with self.assertRaises(ValueError): module.article(XML.replace(b"<abstract>", b'<article-id pub-id-type="pmid">TEST-PMID</article-id><abstract>'), EXPECTED)
    def test_internal_entities_and_large_inputs_fail(self):
        for raw in [b'<!DOCTYPE article [<!ENTITY x "test">]>'+XML, b" "*(module.MAX_BYTES+1), XML.decode().encode("utf-16")]:
            with self.assertRaises(ValueError): module.article(raw, EXPECTED)
    def test_conflicting_restriction_and_no_attribution_fail(self):
        for raw in [XML.replace(b"Fixture permission notice.", b"Non-commercial use only."), XML.replace(b'contrib-type="author"', b'contrib-type="editor"')]:
            with self.assertRaises(ValueError): module.article(raw, EXPECTED)
    def test_unlicensed_abstract_and_retraction_fail(self):
        for raw in [XML.replace(b"<permissions>", b"<other>").replace(b"</permissions>", b"</other>"), XML.replace(b'research-article', b'retraction')]:
            with self.assertRaises(ValueError): module.article(raw, EXPECTED)
    def test_cc0_and_http_licence_canonicalisation(self):
        self.assertEqual(module.licence_uri("http://creativecommons.org/publicdomain/zero/1.0/"), "https://creativecommons.org/publicdomain/zero/1.0/")
    def test_no_production_release_can_be_built_from_test_identifiers(self):
        with self.assertRaises(ValueError): module.build({"sources": [EXPECTED]}, Path("/tmp/no-fixture-source-access"), True)

if __name__ == "__main__": unittest.main()
