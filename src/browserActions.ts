import puppeteer from 'puppeteer';
import url from 'url';

import { Session } from 'cowin-tracker/types';
import { delay, logger } from './helpers';

// 2.0 Check if previous alert still running
const checkBrowserOpen = async () => {
  if (global.globalBrowser) {
    logger('puppeteer', 'Browser already running');
    return true;
  }

  global.globalBrowser = await puppeteer.launch({
    headless: false,
    // executablePath: ''
  });

  return false;
};

// 2.1 Alert User of Available Slot and open Browser
const playYoutubeVideo = async (browser: puppeteer.Browser, alarm: string) => {
  const [alarmPage] = await browser.pages();
  logger('puppeteer', 'Play Youtube Video');
  await alarmPage.goto(alarm);
  await alarmPage.waitForSelector(
    '#movie_player > div.ytp-cued-thumbnail-overlay > button',
  );
  await alarmPage.evaluate(() => {
    (document
      .querySelector('#movie_player > div.ytp-cued-thumbnail-overlay > button') as HTMLElement)
      .click();
  });
};

// 2.2 Open New Page and navigate to cowin login site
const openCowinSite = async (browser: puppeteer.Browser) => {
  logger('puppeteer', 'Open New Page and navigate to cowin login site');
  const page = await browser.newPage();
  await page.goto('https://selfregistration.cowin.gov.in');
  return page;
};

// 2.3 Fill the mobile number
const enterMobileNumber = async (page: puppeteer.Page, phone: string) => {
  await page.waitForSelector('#mat-input-0');
  await delay(800);
  logger('puppeteer', 'Fill the mobile number', phone);
  await page.type('#mat-input-0', phone);
};

// 2.3 Click on submit button
const clickSubmitButtonMobilePage = async (page: puppeteer.Page) => {
  logger('puppeteer', 'Click on submit button');
  await page.evaluate(() => {
    (document
      .querySelector(
        '#main-content > app-login > ion-content > div > ion-grid > ion-row > ion-col > ion-grid > ion-row > ion-col:nth-child(1) > ion-grid > form > ion-row > ion-col.col-padding.md.hydrated > div > ion-button',
      ) as HTMLElement)
      .click();
  });
};

// 2.4 Wait for manual OTP enter and redirection to dashboard
const waitForDashboardPage = async (page: puppeteer.Page) => {
  logger('puppeteer', 'Wait for otp enter and redirect');
  await page.waitForFunction(
    () => (
      window.location.href
      === 'https://selfregistration.cowin.gov.in/dashboard'
    ),
    {
      timeout: 600000,
    },
  );
  await page.waitForSelector(
    '#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(1) > ion-col.register-header.md.hydrated > h3',
  );
};

// 2.5 Click on schedule button for first line item
const clickOnFirstBeneficiarySchedule = async (page: puppeteer.Page) => {
  await page.waitForSelector('#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(2) > ion-col > ion-grid > ion-row.dose-data.md.hydrated > ion-col:nth-child(2) > ul > li > a');
  logger('puppeteer', 'Click on schedule');
  await page.evaluate(() => {
    (document
      .querySelector(
        '#main-content > app-beneficiary-dashboard > ion-content > div > div > ion-grid > ion-row > ion-col > ion-grid.beneficiary-box.md.hydrated > ion-row:nth-child(2) > ion-col > ion-grid > ion-row.dose-data.md.hydrated > ion-col:nth-child(2) > ul > li > a',
      ) as HTMLElement)
      .click();
  });
};

// 2.6 Wait for appointment redirect
const waitForAppointmentPage = async (page: puppeteer.Page) => {
  logger('puppeteer', 'Wait for appointment redirect');
  await page.waitForFunction(
    () => (
      window.location.href
      === 'https://selfregistration.cowin.gov.in/appointment'
    ),
    {
      timeout: 600000,
    },
  );
};

// 2.7 Fill the pincode
const enterPincode = async (page: puppeteer.Page, pincode: number) => {
  await page.waitForSelector('#mat-input-2');
  await delay(500);
  logger('puppeteer', 'Fill the pincode', pincode);
  await page.type('#mat-input-2', `${pincode}`);
};

// 2.8 Click on search button
const clickSearchButtonAppointmentPage = async (page: puppeteer.Page) => {
  logger('puppeteer', 'Click on search button');
  await page.evaluate(() => {
    (document
      .querySelector(
        '#main-content > app-appointment-table > ion-content > div > div > ion-grid > ion-row > ion-grid > ion-row > ion-col > ion-grid > ion-row > ion-col:nth-child(2) > form > ion-grid > ion-row:nth-child(1) > ion-col.col-padding.ion-text-start.ng-star-inserted.md.hydrated > ion-button',
      ) as HTMLElement)
      .click();
  });
};

// 2.9 After puppeteer execution watch for browser changes
const watchBrowser = async (browser: puppeteer.Browser, header: string) => {
  const allPages = await browser.pages();

  const allPagesUrl = allPages.map((page) => (new URL(page.url())).hostname);

  logger(`puppeteer:on:${header}`, allPagesUrl);
  const cowinSiteOpen = allPagesUrl.some(
    (singlePage) => singlePage === 'selfregistration.cowin.gov.in',
  );

  if (!cowinSiteOpen) {
    logger(`puppeteer:on:${header}`, 'Closing browser!');
    await browser.close();
    global.globalBrowser = null;
  }
};

export const openCowin = async (data: Session[], mobile: string, alarm: string, scheduleFirstPerson = false): Promise<void> => {
  let browser: puppeteer.Browser = null;
  try {
    const browserExists = await checkBrowserOpen();
    if (browserExists) {
      return;
    }
    logger('puppeteer', 'Launch the browser');
    browser = await global.globalBrowser;
    browser.on('disconnected', () => watchBrowser(browser, 'disconnected'));
    browser.on('targetdestroyed', () => watchBrowser(browser, 'targetdestroyed'));

    await playYoutubeVideo(browser, alarm);
    const page = await openCowinSite(browser);
    await enterMobileNumber(page, mobile);
    await clickSubmitButtonMobilePage(page);
    await waitForDashboardPage(page);

    if (scheduleFirstPerson) {
      await clickOnFirstBeneficiarySchedule(page);
    }

    await waitForAppointmentPage(page);
    await enterPincode(page, data[0].pincode);
    await clickSearchButtonAppointmentPage(page);
  } catch (err) {
    logger('puppeteer:error', err);
  }
}
