import puppeteer from 'puppeteer-core'
import 'dotenv/config'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const BASE = process.env.PROD_URL ?? 'https://simulation-education-platform.vercel.app'
const XLSX = 'C:/Users/ADMINI~1/AppData/Local/Temp/claude/f--diagram-png/17b705d6-ca7d-4afe-b438-316e4ff18334/scratchpad/cliente.xlsx'
const SHOT = 'F:/prod'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--window-size=1280,1000'],
})

async function waitForPath(page, prefixes) {
  await page.waitForFunction(
    (list) =>
      list.some((p) => location.pathname === p || location.pathname.startsWith(p)) ||
      document.querySelector('[role="alert"]'),
    { timeout: 45000 },
    prefixes,
  )
}

async function clickByText(page, selector, text) {
  return page.evaluate(
    (sel, t) => {
      const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(t))
      if (el) { el.click(); return true }
      return false
    },
    selector,
    text,
  )
}

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 1000 })
  page.setDefaultNavigationTimeout(60000)
  page.setDefaultTimeout(60000)

  // 0. La portada
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  const home = await page.$eval('h1', (h) => h.textContent)
  console.log('0. Portada:', home)
  await page.screenshot({ path: `${SHOT}-0-portada.png` })

  // 1. Login admin
  await page.goto(`${BASE}/ingresar`, { waitUntil: 'domcontentloaded' })
  await page.type('input[name="identifier"]', process.env.SEED_ADMIN_EMAIL)
  await page.type('input[name="password"]', process.env.SEED_ADMIN_PASSWORD)
  await page.click('button[type="submit"]')
  await waitForPath(page, ['/admin', '/inicio'])
  console.log('1. Admin ->', new URL(page.url()).pathname)

  // 2. Importar preguntas
  await page.goto(`${BASE}/admin/preguntas/importar`, { waitUntil: 'domcontentloaded' })
  const input = await page.$('input[type="file"]')
  await input.uploadFile(XLSX)
  await Promise.all([page.waitForSelector('article', { timeout: 60000 }), page.click('button[type="submit"]')])
  const badges = await page.$$eval('span.rounded-full', (els) => els.map((e) => e.textContent.trim()))
  console.log('2. Vista previa:', badges.join(' | '))
  await clickByText(page, 'button', 'Confirmar y cargar')
  await page.waitForSelector('h2.text-success', { timeout: 60000 })
  console.log('3. Preguntas cargadas en producción')

  // 3. Publicar
  await page.goto(`${BASE}/admin/simulacros`, { waitUntil: 'domcontentloaded' })
  await clickByText(page, 'button', 'Publicar')
  await new Promise((r) => setTimeout(r, 2500))
  await page.goto(`${BASE}/admin/simulacros`, { waitUntil: 'domcontentloaded' })
  const pub = await page.$$eval('button', (b) => b.some((x) => x.textContent.includes('Publicado')))
  console.log('4. Simulacro publicado:', pub)

  // 4. Estudiante nuevo
  const cookies = await page.cookies()
  if (cookies.length) await page.deleteCookie(...cookies)
  const stamp = Date.now().toString().slice(-6)
  const user = `alumno${stamp}`
  const pass = 'Prueba2026'
  await page.goto(`${BASE}/registro`, { waitUntil: 'domcontentloaded' })
  await page.type('input[name="fullName"]', 'Alumno de Prueba')
  await page.type('input[name="username"]', user)
  await page.type('input[name="email"]', `${user}@sora.test`)
  await page.type('input[name="password"]', pass)
  await page.type('input[name="confirm"]', pass)
  await page.click('button[type="submit"]')
  await waitForPath(page, ['/inicio'])
  console.log('5. Estudiante registrado ->', new URL(page.url()).pathname)

  // 5. Presentar
  await page.goto(`${BASE}/simulacros`, { waitUntil: 'domcontentloaded' })
  await clickByText(page, 'button', 'Iniciar')
  await waitForPath(page, ['/simulacro/'])
  await page.waitForSelector('article', { timeout: 30000 })
  console.log('6. Simulacro iniciado')
  await page.screenshot({ path: `${SHOT}-1-examen.png` })

  const total = await page.$$eval('nav[aria-label="Preguntas"] button', (b) => b.length)
  for (let i = 0; i < total; i++) {
    await page.evaluate((idx) => {
      document.querySelectorAll('nav[aria-label="Preguntas"] button')[idx]?.click()
    }, i)
    await new Promise((r) => setTimeout(r, 250))
    await page.evaluate(() => document.querySelector('section ul li button')?.click())
    await new Promise((r) => setTimeout(r, 600))
  }
  console.log(`7. Respondidas ${total} preguntas`)

  await clickByText(page, 'button', 'Finalizar')
  await page.waitForSelector('.fixed', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 300))
  await page.evaluate(() => {
    const d = document.querySelector('.fixed')
    const b = [...(d?.querySelectorAll('button') ?? [])].find((x) => x.textContent.includes('Finalizar'))
    b?.click()
  })
  await page.waitForFunction(() => location.pathname.startsWith('/resultados/'), { timeout: 45000 })
  console.log('8. Enviado ->', new URL(page.url()).pathname)

  await page.waitForSelector('h1', { timeout: 20000 })
  const res = await page.evaluate(() =>
    document.querySelector('main')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 160),
  )
  console.log('9. Resultado:', res)
  await page.screenshot({ path: `${SHOT}-2-resultado.png`, fullPage: true })

  console.log('\n✔ PRODUCCIÓN verificada de punta a punta.')
} finally {
  await browser.close()
}
