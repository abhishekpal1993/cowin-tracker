# CoWIN Tracker with Node.js and Puppeteer

Script to check the available slots for Covid-19 Vaccination Centers from CoWIN API in India and partly automate the vaccination scheduling process. This CANNOT book slots automatically. 

* Automated Steps:
    * Open [CoWIN portal](https://selfregistration.cowin.gov.in) when vaccine slots available
    * Enter mobile number and submit form to generate OTP.
    * Enter pincode based on centers with maximum vaccine slots and submit to open the slots table view.

* Manual Steps:
    * Enter OTP
    * Select beneficiary for Schedule
    * Slot Booking
&nbsp;
# Installing Node.js
Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser. 

* For UNIX systems: Install Node.js using [Node Version Manager](https://github.com/nvm-sh/nvm).
* Windows: Install the latest node installer from official website.

# Basic Usage
- Clone the repository using terminal.
- Go to repo folder - `cd cowin-tracker`
- Install all the dependencies - `npm ci`
- Open constants file `src/constants.js` and update following: 
    - `pincodes`: Pincodes of locality to check vaccine availability.
    - `mobile`: Mobile number for login.
- Run - `npm start`

# Additional Setup
- Open constants file `src/constants.js` and update following: 
    - `interval`: Interval for checking available vaccine slots. Lowest possible interval is 15secs below which it will default to 15secs.
    - `alarm`: Youtube video with audio track to alert you about the open browser.
    - `filters`: These filters are used to streamline the scan for vaccine slots. For now only 4 filters are available which can get the job done. Currently all filters work in logical conjunction to each other (logical AND operation)


### Please Note:
* The script only works with Indian IP addresses.
* The [CoWIN API](https://apisetu.gov.in/public/marketplace/api/cowin) currently states : "Further, these APIs are subject to a rate limit of 100 API calls per 5 minutes per IP". To avoid unwanted IP blocks, please refer to below logic:
```javascript
(60 / interval) * (total no.of pincodes) * 5 < 100
```
&nbsp;