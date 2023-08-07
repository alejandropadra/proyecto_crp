import unittest
from app import create_app
from flask import current_app
from app import db, User, Cobranza

class DemoTestCase(unittest.TestCase):
    def setUp(self) -> None:
        return super().setUp()
    
    def tearDown(self) -> None:
        return super().tearDown()
    
    def test_demo(self):
        self.assertTrue(1==1)
