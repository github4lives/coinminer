from playwright.sync_api import sync_playwright, expect
import re

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3001')

    # Wait for the app to initialize by waiting for the input to be enabled
    text_input = page.locator('input[type="text"]')
    expect(text_input).to_be_enabled(timeout=20000)

    # Add credits using cheat code
    text_input.fill('credits_add_9999')
    page.keyboard.press('Enter')
    expect(page.get_by_text("Cheat activated: 9999 credits added.")).to_be_visible()

    # Verify credits updated in header
    # Initial 1000 + 9999 = 10999
    expect(page.get_by_text("Credits: 10999c")).to_be_visible()
    page.screenshot(path='jules-scratch/verification/after_cheat.png')


    # Go to shop
    text_input.fill('view shop')
    page.keyboard.press('Enter')
    expect(page.get_by_text("Welcome to the underground market.")).to_be_visible()
    page.screenshot(path='jules-scratch/verification/shop_view.png')

    # Purchase item
    page.locator('button:has-text("ICE Breaker v2.1 - 5000 credits")').click()

    # Verify purchase was successful and item is in inventory
    expect(page.get_by_text("Purchase successful.")).to_be_visible()
    # Check inventory list
    inventory_section = page.locator("div:has-text('Your Inventory:')")
    expect(inventory_section.get_by_text("ICE Breaker v2.1")).to_be_visible()

    # Verify credits were deducted (10999 - 5000 = 5999)
    expect(page.get_by_text("Credits: 5999c")).to_be_visible()

    page.screenshot(path='jules-scratch/verification/after_purchase.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
