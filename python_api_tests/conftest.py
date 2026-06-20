import pytest
import os
from playwright.sync_api import sync_playwright

LOCAL = os.getenv("LOCAL", "false").lower() == "true"
BASE_URL = os.getenv(
    "BASE_URL",
    "http://localhost:8080" if LOCAL else "https://opensource-demo.orangehrmlive.com",
)
USERNAME = os.getenv("OHRM_USERNAME", "Admin")
PASSWORD = os.getenv("OHRM_PASSWORD", "Orangehrm@2026" if LOCAL else "admin123")


@pytest.fixture(scope="session")
def playwright():
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope="session")
def browser(playwright):
    browser = playwright.chromium.launch(headless=not os.getenv("HEADED"))
    yield browser
    browser.close()


@pytest.fixture
def page(browser):
    context = browser.new_context(base_url=BASE_URL)
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture
def logged_in_page(page):
    page.goto("/web/index.php/auth/login")
    page.locator("input[name='username']").wait_for(state="visible", timeout=10000)
    page.fill("input[name='username']", USERNAME)
    page.fill("input[name='password']", PASSWORD)
    page.click("button[type='submit']")
    page.wait_for_url("**/dashboard**", timeout=15000)
    return page
