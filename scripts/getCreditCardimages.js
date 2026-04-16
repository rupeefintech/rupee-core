import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import archiver from "archiver"

const URL = "https://www.banksathi.com/credit-cards"
const DIR = "./cards"

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR)

// clean filename
const clean = (str) =>
  str.replace(/[^a-z0-9]/gi, "-").toLowerCase()

async function scrape() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(URL, { waitUntil: "networkidle2" })

  // scroll to load all cards
  await autoScroll(page)

  // extract cards
  const cards = await page.evaluate(() => {
    const data = []

    // Try multiple selectors (important)
    const cardContainers = document.querySelectorAll("div, section")

    cardContainers.forEach((el) => {
      const img = el.querySelector("img")
      const title =
        el.querySelector("h3") ||
        el.querySelector("h2") ||
        el.querySelector("p")

      if (img && title) {
        const name = title.innerText.trim()
        const src = img.src

        if (
          name.toLowerCase().includes("credit") &&
          src &&
          src.startsWith("http")
        ) {
          data.push({
            cardName: name,
            image: src
          })
        }
      }
    })

    return data
  })

  // remove duplicates
  const unique = [...new Map(cards.map(c => [c.image, c])).values()]

  console.log("Total cards:", unique.length)

  // download images
  for (let i = 0; i < unique.length; i++) {
    const card = unique[i]

    try {
      const view = await page.goto(card.image)
      const buffer = await view.buffer()

      const filename = `${clean(card.cardName)}.png`
      fs.writeFileSync(path.join(DIR, filename), buffer)

      card.image = `/cards/${filename}`
    } catch (e) {
      console.log("Failed:", card.cardName)
    }
  }

  // save JSON
  fs.writeFileSync("cards.json", JSON.stringify(unique, null, 2))

  await browser.close()

  // zip
  zipFolder(DIR, "cards.zip")

  console.log("✅ DONE")
}

// auto scroll
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0
      const distance = 100

      const timer = setInterval(() => {
        window.scrollBy(0, distance)
        total += distance

        if (total >= document.body.scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

// zip function
function zipFolder(source, out) {
  const archive = archiver("zip")
  const stream = fs.createWriteStream(out)

  archive
    .directory(source, false)
    .pipe(stream)

  archive.finalize()
}

scrape()