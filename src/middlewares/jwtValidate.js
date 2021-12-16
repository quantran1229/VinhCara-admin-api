import Constant from "../constants";
import Response from '../utils/response';
import {
    verify
} from "jsonwebtoken";
import Logger from '../utils/logger';
import { getPublicKey } from "../utils/utils";

const res = new Response();

// Check if version have word Lastest or not
export default (ctx, next) => {
    try {
        let token = undefined;
        // Check token in authorization header(Bearer) 
        if (ctx.header.authorization) {
            // Bearer token
            if (ctx.header.authorization.substring(0, 6) === "Bearer")
                token = ctx.header.authorization.substring(7);
            else token = ctx.header.authorization;
        } else if (ctx.request.query && ctx.request.query.token) {
            token = ctx.request.query.token;
        }
        if (!token || token === "") {
            res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
            return res.send(ctx);
        }

        // Get public key
        let publicKey = getPublicKey();
        try {
            let a = verify(token, publicKey);
            ctx.state.user = {
                id: a["id"]
            };
        } catch (e) {
            res.setError("Unauthorized", Constant.instance.HTTP_CODE.Unauthorized);
            return res.send(ctx);
        }
        return next();
    } catch (e) {
        Logger.error('jwtValidate ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
        res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError, null, Constant.instance.ERROR_CODE.SERVER_ERROR);
        return res.send(ctx);
    }
}