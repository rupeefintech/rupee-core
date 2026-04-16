import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import https from "https"
import archiver from "archiver"

const URL = "https://www.banksathi.com/credit-cards"
const DIR = "./cards"

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR)

const clean = (str) =>
  str.replace(/[^a-z0-9]/gi, "-").toLowerCase()

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject("Failed")

      const file = fs.createWriteStream(filepath)
      res.pipe(file)
      file.on("finish", () => file.close(resolve))
    }).on("error", reject)
  })
}

async function zipFolder(source, out) {
  const archive = archiver("zip")
  const stream = fs.createWriteStream(out)

  archive.directory(source, false).pipe(stream)
  await archive.finalize()
}

async function scrape() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  await page.goto(URL, { waitUntil: "networkidle2" })

  await autoScroll(page)

  const cards = await page.evaluate(() => {
    const results = []

    document.querySelectorAll("div").forEach(el => {
      const img = el.querySelector("img")
      const title = el.querySelector("h3, h2")

      if (img && title) {
        const src =
          img.currentSrc || img.src || img.getAttribute("data-src")

        if (src && src.startsWith("http")) {
          results.push({
            cardName: title.innerText.trim(),
            image: src
          })
        }
      }
    })

    return results
  })

  const unique = [...new Map(cards.map(c => [c.image, c])).values()]

  console.log("Found:", unique.length)

  for (let card of unique) {
    try {
      const filename = `${clean(card.cardName)}.png`
      const filepath = path.join(DIR, filename)

      await downloadImage(card.image, filepath)
      card.image = `/cards/${filename}`

      console.log("Downloaded:", card.cardName)
    } catch {
      console.log("Failed:", card.cardName)
    }
  }

  fs.writeFileSync("cards.json", JSON.stringify(unique, null, 2))

  await browser.close()

  await zipFolder(DIR, "cards.zip")

  console.log("✅ ZIP READY: cards.zip")
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
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

scrape()