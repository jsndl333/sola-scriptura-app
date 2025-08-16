import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto('http://localhost:8000/index.html')

        # Mock the API response
        await page.route(
            "**/api/check",
            lambda route: route.fulfill(
                status=200,
                json={
                    "candidates": [
                        {
                            "content": {
                                "parts": [
                                    {"text": "This is a mock response from the API."}
                                ]
                            }
                        }
                    ]
                },
            ),
        )

        # Enter text and click the button
        await page.locator('textarea#topicInput').fill('Test topic')
        await page.locator('button:has-text("Check Sola Scriptura")').click()

        # Wait for the result to be visible
        await expect(page.locator('#result')).to_be_visible()

        # Wait for the play audio button to be visible
        await expect(page.locator('#playAudioBtn')).to_be_visible()

        # Take a screenshot
        await page.screenshot(path='jules-scratch/verification/verification.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
