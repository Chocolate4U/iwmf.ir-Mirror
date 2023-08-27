import { PlaywrightCrawler, Dataset, log } from 'crawlee';

const crawler = new PlaywrightCrawler({
    minConcurrency: 10,
    maxConcurrency: 100,
    maxRequestRetries: 5,
    requestHandlerTimeoutSecs: 60,
    requestHandler: async ({ page, request, enqueueLinks }) => {
        log.info(request.url);
        if (request.label === 'DETAIL') {
            const TITLE = await page.locator('span.onvan span').textContent();
            if (TITLE) {
                const website = page.locator('.site').getAttribute('href');
                const pwa = page.locator('a.pwa').getAttribute('href');
                const app = page.locator('a.bazar').getAttribute('href');
                try {
                    var WEBSITE = await website;
                } catch {
                    WEBSITE = "N/A";
                }
                try {
                    var PWA = await pwa;
                } catch {
                    PWA = "N/A";
                }
                try {
                    var APP = await app;
                } catch {
                    APP = "N/A";
                }
                await Dataset.pushData({
                    Title: TITLE,
                    Website: WEBSITE,
                    PWA: PWA,
                    Application: APP
                })
            }
        } else {
            await page.waitForSelector('a[rel="next"]');
            await enqueueLinks({
                selector: 'a[rel=next]',
                label: 'LIST',
            });
            await page.waitForSelector('div[class="detail-wrapper"]');
            await enqueueLinks({
                globs: ['https://profile.iwmf.ir/organizations/*'],
                label: 'DETAIL',
            });
        };
    }
});
await crawler.run(['https://directory.iwmf.ir']);
await Dataset.exportToJSON('iwmf');
await Dataset.exportToCSV('iwmf');