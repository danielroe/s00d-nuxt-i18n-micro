import { fileURLToPath } from 'node:url'
import { expect, test } from '@nuxt/test-utils/playwright'

test.use({
  nuxt: {
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  },
})

test('test index', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('en')

  await goto('/de', { waitUntil: 'hydration' })
  await expect(page.locator('#locale')).toHaveText('de')
})

test('test links', async ({ page, goto }) => {
  await goto('/dir1/test', { waitUntil: 'hydration' })
  await expect(page.locator('#test_link')).toHaveText('link in en')

  await goto('/de/dir1/test', { waitUntil: 'hydration' })
  await expect(page.locator('#test_link')).toHaveText('link in de')
})

test('test language detection and redirect based on navigator.languages', async ({ page, goto }) => {
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    })
  })

  // Переходим на главную страницу
  await goto('/ru/page', { waitUntil: 'hydration' })

  const currentURL = page.url()

  expect(new URL(currentURL).pathname).toBe('/page')

  await expect(page.locator('#content')).toHaveText('Page content in en')
})

test('test plugin methods output on page', async ({ page, goto }) => {
  // Navigate to the /page route
  await goto('/page', { waitUntil: 'hydration' })

  // Verify the locale
  await expect(page.locator('#locale')).toHaveText('Current Locale: en')

  // Verify the list of locales
  await expect(page.locator('#locales')).toHaveText('en, de, ru')

  // Verify the translation for a key
  await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

  // Verify the pluralization for items
  await expect(page.locator('#plural')).toHaveText('2 items') // Replace with actual pluralization result

  // Verify the localized route generation
  await expect(page.locator('#localized-route')).toHaveText('/de/page')
})

test('test locale switching on page', async ({ page, goto }) => {
  // Navigate to the /page route in English
  await goto('/page', { waitUntil: 'hydration' })

  await expect(page).toHaveURL('/page')

  await expect(page.locator('#locale')).toHaveText('Current Locale: en')

  // Verify the translation for a key after switching locale
  await expect(page.locator('#translation')).toHaveText('Page example in en') // Replace with actual expected content

  // Verify the pluralization for items after switching locale
  await expect(page.locator('#plural')).toHaveText('2 items') // Replace with actual pluralization result in German

  // Verify the localized route generation after switching locale
  await expect(page.locator('#localized-route')).toHaveText('/de/page')

  // Click the link to switch to the German locale
  await page.click('#link-de')

  // Verify that the URL has changed
  await expect(page).toHaveURL('/de/page')

  // Verify the locale after switching
  await expect(page.locator('#locale')).toHaveText('Current Locale: de')

  // Verify the translation for a key after switching locale
  await expect(page.locator('#translation')).toHaveText('Page example in de') // Replace with actual expected content

  // Verify the pluralization for items after switching locale
  await expect(page.locator('#plural')).toHaveText('2 items') // Replace with actual pluralization result in German

  // Verify the localized route generation after switching locale
  await expect(page.locator('#localized-route')).toHaveText('/de/page')
})

test('test locale switching on locale-test page', async ({ page }) => {
  // Navigate to the /locale-test route in English
  await page.goto('/locale-test', { waitUntil: 'networkidle' })

  // Verify the URL and content in English
  await expect(page).toHaveURL('/locale-test')
  await expect(page.locator('h1')).toHaveText('Locale Test Page')
  await expect(page.locator('#content')).toHaveText('This is a content area.')
  await expect(page.locator('#username')).toHaveText('Hello, John!')
  await expect(page.locator('#plural')).toHaveText('You have 2 items.')
  await expect(page.locator('#html-content')).toHaveText('Bold Text with HTML content.')

  // Switch to German locale
  await page.click('#link-de')

  // Verify the URL and content in German
  await expect(page).toHaveURL('/de/locale-test')
  await expect(page.locator('h1')).toHaveText('Sprachtestseite')
  await expect(page.locator('#content')).toHaveText('Dies ist ein Inhaltsbereich.')
  await expect(page.locator('#username')).toHaveText('Hallo, John!')
  await expect(page.locator('#plural')).toHaveText('Sie haben 2 Artikel.')
  await expect(page.locator('#html-content')).toHaveText('Fetter Text mit HTML-Inhalt.')
})
