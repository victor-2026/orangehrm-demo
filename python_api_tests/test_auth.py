import pytest


class TestAuth:
    def test_login_page_loads(self, page):
        page.goto("/web/index.php/auth/login")
        username_input = page.locator("input[name='username']")
        username_input.wait_for(state="visible", timeout=10000)
        assert username_input.is_visible()
        assert page.locator("input[name='password']").is_visible()
        assert page.locator("button[type='submit']").is_visible()

    def test_valid_login_redirects_to_dashboard(self, logged_in_page):
        assert "/dashboard" in logged_in_page.url

    def test_invalid_login_shows_error(self, page):
        page.goto("/web/index.php/auth/login")
        username_input = page.locator("input[name='username']")
        username_input.wait_for(state="visible", timeout=10000)
        page.fill("input[name='username']", "Admin")
        page.fill("input[name='password']", "wrongpassword")
        page.click("button[type='submit']")
        alert = page.locator(".oxd-alert-content-text")
        alert.wait_for(state="visible", timeout=10000)
        assert alert.is_visible()
        assert "Invalid" in alert.text_content()

    def test_logout_returns_to_login(self, logged_in_page):
        logged_in_page.goto("/web/index.php/auth/logout")
        logged_in_page.wait_for_url("**/auth/login**", timeout=10000)
        assert "/auth/login" in logged_in_page.url
