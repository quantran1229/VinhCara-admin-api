// Load .env
import dotenv from 'dotenv'
dotenv.config()

// Constant class to store constant value + value set using ENV
export default class Constant {
    static instance = new Constant();
    // Default Http Code
    HTTP_CODE = {
        Success: 200,
        Created: 201,
        SuccessNoContent: 204,
        BadRequest: 400,
        Unauthorized: 401,
        Forbidden: 403,
        NotFound: 404,
        Conflict: 409,
        BodyParseError: 422,
        InternalError: 500,
        Moved: 301
    }

    // Set Constant variable as ENV variable
    APP_PORT = process.env.APP_PORT;
    APP_HOST = process.env.APP_HOST;
    NODE_ENV = process.env.NODE_ENV;
    LOGS_PATH = process.env.LOGS_PATH;
    HEALTH_CHECK_KEY = process.env.HEALTH_CHECK_KEY;
    PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;
    PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH;
    // Database config
    DATABASE_CONFIG = {
        dialect: process.env.DATABASE_DIALECT,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        port: process.env.DATABASE_PORT,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        logging: process.env.DATABASE_LOGGING,
    }

    ERROR_CODE = {
        SERVER_ERROR: '0000000',
        CUSTOMER_DUPLICATE_EMAIL: '0000001',
        CUSTOMER_DUPLICATE_PHONE: '0000002',
        CUSTOMER_NOT_FOUND_OR_BAD_PASSWORD: '0000003',
        BAD_PASSWORD: '0000004',
        CUSTOMER_ACTIVE_NEEDED: '0000005',
        CUSTOMER_IS_BANNED: '0000006',

        ORDER_NO_ITEM_IN_CART: '0100000',
        ORDER_NO_DIAMOND_IN_STOCK: '0100003',
        ORDER_NO_JEWELLERY_IN_STOCK: '0100004',

        ORDER_NOT_BELONG_TO_USER: '0100010',

        CART_JEWELLERY_NOT_FOUND: '0200001',
        CART_DIAMOND_NOT_FOUND: '0200002',
        CART_DIAMOND_ALREADY_EXIST: '0200003',
        CART_BAD_REQUEST: '0200004'
    }

    API_URL = process.env.API_URL;
    WEB_PUBLIC_URL = process.env.WEB_PUBLIC_URL;

    SIMILAR_PRICE_RANGE = 20000000;
    DEFAULT_PAGE_NUMBER = 1;
    DEFAULT_LIMIT_PER_PAGE = 40;
    DEFAULT_SALT_ROUND = 10;
    RANDOM_STRING_LENGTH = 5;
    DEFAULT_NUMBER_DIAMOND_FOR_JEWELLERY = 12;

    MAIL_TYPE = {
        ACTIVATE_CUSTOMER: 2,
        PASSWORD_CUSTOMER_FORGET: 1,
        PASSWORD_USER_FORGET: 5,
        CONFIRM_ORDER: 3,
        CONFIRM_RETURN: 4
    }

    REDIS_CONFIG = {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }

    QUEUE_CONFIG = {
        MAIL_QUEUE: process.env.QUEUE_MAIL_NAME
    }

    constructor(){
    }
}