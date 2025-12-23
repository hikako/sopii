const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 5678;

app.get('/', (req, res) => {
    res.send('Sopii Scraper is Running! Use /scrape?url=SHOPEE_PRODUCT_URL to get data.');
});

// The Scraping Route
app.get('/scrape', async (req, res) => {
    const productUrl = req.query.url;

    if (!productUrl) {
        return res.status(400).json({ error: 'Please provide a Shopee URL' });
    }

    console.log(`Scraping: ${productUrl}`);

    try {
        // Launch Browser (Headless for Server)
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Shopee Anti-Bot Bypass (Basic)
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for rating section to load (adjust selector based on actual Shopee HTML)
        // Note: Selectors change often. This is a generic example.
        const title = await page.title();

        // Get Data
        const data = await page.evaluate(() => {
            // Try to find the rating number
            const ratingElement = document.querySelector('._1k47d8'); // Example Class
            const rating = ratingElement ? ratingElement.innerText : 'Not Found';
            
            return {
                title: document.title,
                rating: rating
            };
        });

        await browser.close();
        res.json({ success: true, data: data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});