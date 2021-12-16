import winston, {
    createLogger,
    format,
    transports,
    addColors
} from "winston";
const {
    combine,
    timestamp,
    splat,
    label,
    align,
    printf
} = format;
import dayjs from "dayjs";
import Constant from "../constants";

const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        sql: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        sql: "blue",
        http: "cyan",
        debug: "grey",
    },
};
winston.addColors(logLevels.colors);

const myFormat = printf(({
    level,
    message,
    label,
    timestamp
}) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
    levels: logLevels.levels,
    format: combine(
        timestamp(),
        myFormat,
        align(),
        splat(),
        winston.format.colorize()
    ),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({
            filename: `${Constant.instance.LOGS_PATH}/error-${dayjs().format("DDMMYYYY")}.log`,
            level: "error",
        }),
        new winston.transports.File({
            filename: `${Constant.instance.LOGS_PATH}/combined-${dayjs().format("DDMMYYYY")}.log`,
            level: "info",
        }),
    ],
});

// Log into console
function filterOnly(level) {
    return format((info, opts) => {
        const sys = Symbol.for("level");
        if (info[sys] === level) {
            return info;
        }
    })();
}

if (Constant.instance.NODE_ENV !== "production") {
    for (const i of Object.keys(logLevels.levels)) {
        logger.add(
            new winston.transports.Console({
                level: i,
                format: combine(
                    timestamp(),
                    myFormat,
                    align(),
                    splat(),
                    winston.format.colorize(),
                    filterOnly(i) // filter only log in this level because winston will log from level < i
                ),
            })
        );
    }
}

export default logger;