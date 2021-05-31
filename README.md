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

# Installing Node.js
Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser. 

* For UNIX systems: Install Node.js using [Node Version Manager](https://github.com/nvm-sh/nvm).
* Windows: Install the latest node installer from official website.

# Basic Usage
- Clone the repository using terminal.
- Go to repo folder - `cd cowin-tracker`
- Install all the dependencies - `npm ci`
- Open constants file `src/constants.ts` and update following: 
    - `pincodes`: Pincodes of locality to check vaccine availability.
    - `mobile`: Mobile number for login.
    - `interval`: Interval for checking available vaccine slots, in seconds. Lowest possible interval is 15secs below which it will default to 15secs.
    - `filters`: Filters are used to streamline the scan for vaccine slots. Following filters work in logical conjunction to each other (logical AND operation):
        - `fee_type`: Fee type for vaccination. Possible values - **Free** or **Paid**.
        - `age_group`: Age group for vaccination. Possible values - **18+** or **45+**.
        - `vaccine`: Type of vaccine. Possible values - **COVISHIELD** or **COVAXIN** (more will be added later).
        - `looking_for`: Searching for first or second dose of vaccination. Possible values - **Dose1** or **Dose2**.
    - `alarm`: Youtube video link with audio track to alert you about the open browser.
- Run - `npm start`

# Additional Configurations (Optional)
Open constants file `src/constants.ts` and add following:
- `backgroundSearch`: Allow background API request calls to search for slots when browser is open. Default value is **False**.
- `scheduleFirstPerson`: Automatically choose first person from list on dashboard. Default value is **False**.

### Please Note:
* The script only works with Indian IP addresses.
* The [CoWIN API](https://apisetu.gov.in/public/marketplace/api/cowin) currently states : "Further, these APIs are subject to a rate limit of 100 API calls per 5 minutes per IP". To avoid unwanted IP blocks, please refer to below logic:
```javascript
(60 / interval) * (total no.of pincodes) * 5 < 100
```
* If none of the filters are added in constants file, then all centers will be considered which have atleast one vaccine slot available irrespective of type, age_group, fee.
&nbsp;
