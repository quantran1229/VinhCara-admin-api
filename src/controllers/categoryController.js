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
    Category
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

export default class CategoryController {
    // Get category list with all subitems

    static getCategoryListTree = async (ctx, next) => {
        try {
            let categoryList = await Category.findAll({
                raw: true
            });
            let list = categoryList.filter(e=>!e.parentId);
            categoryList = categoryList.filter(e=>e.parentId);
            for (let mainCategory of list)
            {
                let result = recusive(mainCategory,categoryList);
                mainCategory = result.value;
                categoryList = result.list;
            }
            // Return info
            res.setSuccess(list, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCategoryListTree ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }

    static getCategoryList = async (ctx, next) => {
        try {
            let categoryList = await Category.findAll({});
            // Return info
            res.setSuccess(categoryList, Constant.instance.HTTP_CODE.Success);
            return res.send(ctx);
        } catch (e) {
            Logger.error('getCategoryList ' + e.message + ' ' + e.stack +' '+ (e.errors && e.errors[0] ? e.errors[0].message : ''));
            res.setError(`Error`, Constant.instance.HTTP_CODE.InternalError,null, Constant.instance.ERROR_CODE.SERVER_ERROR);
            return res.send(ctx);
        }
    }
}