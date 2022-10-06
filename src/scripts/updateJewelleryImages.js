import db,{
    Jewellery
} from '../models';
import csv from 'csvtojson/v2'

let run = async() =>{
    let transaction
    try{
        transaction = await db.sequelize.transaction();
        let list = await csv().fromFile('./jewelleryImage.csv');
        for(let jew of list)
        {
            let j = await Jewellery.findOne({
                where:{
                    productCode: jew.productCode
                },
                attributes:["productCode","isShowOnWeb","mediafiles","type"],
                logging: false
            });
            let iList = [];
            let images = jew.images.split(";")
            if (images.length > 0)
            {
                for (let i of images)
                if (i != '')
                {
                    let name = i.split(".png")[0];
                    iList.push({
                        mainImage: `https://mediafile.vinhcara.com/${name}.webp`,
                        urlVideo: null,
                        subImage: `https://mediafile.vinhcara.com/${name}thumbnail.webp`
                    })
                }
                if (j && j.type == 3) iList = iList.reverse();
            }
            await Jewellery.update({
                isShowOnWeb: jew.isShowOnWeb == 1 ? true : false,
                mediafiles: {
                    images: iList
                }
            },{
                where:{
                    productCode: jew.productCode
                },
                transaction: transaction,
                logging: false
            })
        }
        await transaction.commit();
        console.log("Done")
        process.exit();
    }
    catch(err)
    {
        // if (transaction) await transaction.rollback();
        console.log(err)
    }
}

run()