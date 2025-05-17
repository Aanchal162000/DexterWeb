import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import dayjs from "dayjs";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "Few seconds",
    m: "1 minute",
    mm: "%d minutes",
    h: "1 hour",
    hh: "%d hours",
    d: "1 day",
    dd: "%d days",
    M: "1 month",
    MM: "%d months",
    y: "1 year",
    yy: "%d years",
  },
});

export default dayjs;
