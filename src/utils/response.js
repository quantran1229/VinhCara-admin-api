import Constant from "../constants";

export default class Response {

    constructor() {
        this.statusCode = null;
        this.content = undefined;
    }

    setSuccess(data, statusCode, msg, code) {
        this.statusCode = statusCode ? statusCode : Constant.instance.HTTP_CODE.Success;
        if (this.statusCode == Constant.instance.HTTP_CODE.SuccessNoContent)
            return;
        this.content = {
            statusCode: this.statusCode,
            data,
            msg,
            code,
        };
    }

    setError(msg, statusCode, data, code) {
        this.statusCode = statusCode ? statusCode : Constant.instance.HTTP_CODE.InternalError;
        this.content = {
            statusCode: this.statusCode,
            data,
            error: msg,
            code,
        };
    }

    send(ctx) {
        ctx.status = this.statusCode;
        if (ctx.status !== Constant.instance.HTTP_CODE.SuccessNoContent) {
            ctx.body = this.content;
        }
        return;
    }
}