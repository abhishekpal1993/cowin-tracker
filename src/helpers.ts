import axios, { AxiosResponse } from "axios";
import debug from "debug";
import moment from "moment";

import { CowinResponse, Filters, Session } from "cowin-tracker/types";

export const namespace = "cowin-tracker";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = (header = "", ...msgs: any[]): void => {
  debug(`${namespace}:${header}`).apply(undefined, ["%O", ...msgs]);
};

export const scriptStatus = (header: string): void =>
  logger(`Script:${header}`, moment());

export const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    logger("delay", `Wait for ${milliseconds} milliseconds`);
    setTimeout(() => resolve(), milliseconds);
  });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const loggerFilter = (session: Session) => ({
  name: session.name,
  address: session.address,
  pincode: session.pincode,
  fee_type: session.fee_type,
  date: session.date,
  vaccine: session.vaccine,
  capacity: session.available_capacity,
  capacity_dose1: session.available_capacity_dose1,
  capacity_dose2: session.available_capacity_dose2,
  age_group: session.min_age_limit,
});

export const dataFilter = (session: Session, filters: Filters): boolean => {
  let flag = true;

  // default
  flag = flag && session.available_capacity > 0;

  // filter by fee
  if (
    flag &&
    filters.fee_type &&
    (filters.fee_type === "Free" || filters.fee_type === "Paid")
  ) {
    flag = flag && session.fee_type === filters.fee_type;
  }

  // filter by vaccine type
  if (
    flag &&
    filters.vaccine &&
    (filters.vaccine === "COVISHIELD" || filters.vaccine === "COVAXIN")
  ) {
    flag = flag && session.vaccine === filters.vaccine;
  }

  // filter by age group
  if (flag && filters.age_group && filters.age_group === "18+") {
    flag = flag && session.min_age_limit < 45;
  }

  if (flag && filters.age_group && filters.age_group === "45+") {
    flag = flag && session.min_age_limit >= 45;
  }

  // filter by dose1 or dose 2
  if (flag && filters.looking_for && filters.looking_for === "Dose1") {
    flag = flag && session.available_capacity_dose1 > 0;
  }

  if (flag && filters.looking_for && filters.looking_for === "Dose2") {
    flag = flag && session.available_capacity_dose2 > 0;
  }

  return flag;
};

export const dataSort = (
  session1: Session,
  session2: Session,
  filters: Filters
): number => {
  if (filters.looking_for && filters.looking_for === "Dose2") {
    return (
      session2.available_capacity_dose2 - session1.available_capacity_dose2
    );
  }

  return session2.available_capacity_dose1 - session1.available_capacity_dose1;
};

export const fetchByPinWeekWise = (
  pincodes: string[] = [],
  backgroundSearch = false
): Promise<Session[]> => {
  const url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin";
  const promises = [];

  if (!backgroundSearch && global.globalBrowser) {
    logger("fetchByPinWeekWise", "Browser already running");
    return Promise.resolve([]);
  }

  promises.push(
    ...pincodes.map((pincode) =>
      axios
        .get(url, {
          params: {
            pincode,
            date: moment().format("DD-MM-YYYY"),
          },
          headers: {
            accept: "application/json",
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
          },
        })
        .then((response: AxiosResponse<CowinResponse>) =>
          response.data.centers.reduce(
            (acc, center) =>
              acc.concat(
                ...center.sessions.map((session) => ({
                  ...center,
                  ...session,
                }))
              ),
            []
          )
        )
        .catch((err) => {
          logger("fetchByPinWeekWise:error", err.message);
          return [];
        })
    )
  );

  return Promise.all(promises).then((data) =>
    data.reduce((acc, session) => acc.concat(...session), [])
  );
};
