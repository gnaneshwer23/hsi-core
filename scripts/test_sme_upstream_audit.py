import importlib.util
import pathlib
import unittest
spec=importlib.util.spec_from_file_location("audit",pathlib.Path(__file__).with_name("sme-upstream-audit.py"))
audit=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
class InventoryTests(unittest.TestCase):
    def test_bun(self):
        self.assertEqual(audit.inventory(b'{"lockfileVersion":1,"packages":{"@x/y":["@x/y@1.2.3","",{}, "sha512-x"],},}',"Bun"),[("@x/y","1.2.3")])
    def test_bun_reject_git(self):
        with self.assertRaises(ValueError):
            audit.inventory(b'{"lockfileVersion":1,"packages":{"x":["x@git:abc","",{}]}}',"Bun")
    def test_cargo_workspace(self):
        raw=b'[[package]]\nname="local"\nversion="1.0.0"\n[[package]]\nname="remote"\nversion="2.0.0"\nsource="registry+https://github.com/rust-lang/crates.io-index"'
        self.assertEqual(audit.inventory(raw,"crates.io"),[("remote","2.0.0")])
    def test_uv_workspace(self):
        raw=b'[[package]]\nname="local"\nversion="1.0.0"\nsource={editable="."}\n[[package]]\nname="remote"\nversion="2.0.0"\nsource={registry="https://pypi.org/simple"}'
        self.assertEqual(audit.inventory(raw,"PyPI"),[("remote","2.0.0")])
    def test_npm(self):
        self.assertEqual(audit.inventory(b'{"packages":{"":{},"node_modules/x":{"version":"1.0.0"}}}',"npm"),[("x","1.0.0")])
if __name__=="__main__":
    unittest.main()
