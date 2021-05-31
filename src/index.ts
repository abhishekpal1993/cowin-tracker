import {
  fetchByPinWeekWise,
  logger,
  scriptStatus,
  loggerFilter,
  dataFilter,
  dataSort,
} from "./helpers";
import { constants } from "./constants";
import { openCowin } from "./browserActions";

logger(
  "Script",
  constants.interval < 15
    ? "Interval less than 15, fallback to default"
    : `Interval set to ${constants.interval} seconds`
);

const main = async () => {
  scriptStatus("Start");
  const data = await fetchByPinWeekWise(
    constants.pincodes,
    constants.backgroundSearch
  );
  const filteredData = data
    .filter((session) => dataFilter(session, constants.filters))
    .sort((session1, session2) =>
      dataSort(session1, session2, constants.filters)
    );
  logger("data", data.map(loggerFilter));
  logger("filteredData", filteredData.map(loggerFilter));

  if (filteredData.length > 0) {
    await openCowin(
      filteredData,
      constants.mobile,
      constants.alarm,
      constants.scheduleFirstPerson
    );
  }

  scriptStatus("End");
};

try {
  main();
} catch (err) {
  // eslint-disable-next-line no-console
  logger("Script:Catch", err);
  scriptStatus("End");
} finally {
  setInterval(main, (constants.interval < 15 ? 15 : constants.interval) * 1000);
}
