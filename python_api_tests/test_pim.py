import pytest


class TestPimEmployees:
    def test_employee_list_page_loads(self, logged_in_page):
        logged_in_page.goto("/web/index.php/pim/viewEmployeeList")
        table = logged_in_page.locator(".oxd-table")
        table.wait_for(state="visible", timeout=10000)
        assert table.is_visible()

    def test_add_employee_form_opens(self, logged_in_page):
        logged_in_page.goto("/web/index.php/pim/viewEmployeeList")
        logged_in_page.locator(".oxd-table").wait_for(state="visible", timeout=10000)
        logged_in_page.click("button:has-text('Add')")
        first_name = logged_in_page.locator("input[name='firstName']")
        first_name.wait_for(state="visible", timeout=10000)
        assert first_name.is_visible()
        assert logged_in_page.locator("input[name='lastName']").is_visible()

    def test_search_employee(self, logged_in_page):
        logged_in_page.goto("/web/index.php/pim/viewEmployeeList")
        logged_in_page.locator(".oxd-table").wait_for(state="visible", timeout=10000)
        search_input = logged_in_page.locator(
            ".oxd-input-group input[placeholder='Type for hints...']"
        ).first
        search_input.fill("Admin")
        logged_in_page.click("button:has-text('Search')")
        table = logged_in_page.locator(".oxd-table")
        table.wait_for(state="visible", timeout=5000)
        assert table.is_visible()
