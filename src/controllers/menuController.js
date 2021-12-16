import Logger from '../utils/logger';
import Response from '../utils/response';
import Constant from '../constants';
import {
    remove as removeAccent
} from 'diacritics'
import {
    Op,
    Sequelize
} from 'sequelize'
import db, {
    Menu
} from '../models';

const res = new Response();


// recusive
let recusive = (x,list)=>{
    x.subs = list.filter(e=>e.parentId == x.id).sort((a,b)=>a.id-b.id);
    list = list.filter(e=>e.parentId != x.id);
    for (let sub of x.subs)
    {
        let result = recusive(sub,list);
        sub = result.value;
        list = result.list;
    }
    return {
        value: x,
        list: list
    };
}

export default class MenuController {
    // Get menu list with all subitems

    static getMenuList = async (ctx, next) => {
        try {
            let menuList = await Menu.findAll({
                where: {},
                raw: true
            });
            let list = menuList.filter(e=>!e.parentId);
            menuList = menuList.filter(e=>e.parentId);
            for (let mainMenu of list)
            {
                let result = recusive(mainMenu,menuList);
                mainMenu = result.value;
                menuList = result.list;
            }
            // Return info
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getMenuList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}