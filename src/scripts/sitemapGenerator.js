import {
    SitemapStream,
    streamToPromise,
    SitemapIndexStream
} from 'sitemap';
import {
    Jewellery,
    Blog,
    Sitemap,
    BlogType
} from '../models';
import {
    Op
} from 'sequelize';
import _ from 'lodash'

const generateProductSitemap = async () => {
    const totalSitemap = [];
    const totalProductList = await Jewellery.findAll({
        where: {
            isShowOnWeb: true
        },
        order: [
            ['mainCategory', 'ASC'],
            ['productName', 'ASC']
        ],
        attributes: ['productCode', 'productName', 'mainCategory', 'type', 'mediafiles', 'slug'],
    });

    const listChunk = _.chunk(totalProductList, 200);
    for (let [index, productList] of listChunk.entries()) {
        const smStream = new SitemapStream({
            hostname: process.env.WEB_PUBLIC_URL,
            lastmodDateOnly: false, // print date not time
            xmlns: { // trim the xml namespace
                news: false, // flip to false to omit the xml namespace for news
                xhtml: false,
                image: true,
                video: false
            }
        })
        // coalesce stream to value
        // alternatively you can pipe to another stream

        smStream.write({
            url: `/`,
            changefreq: 'daily',
        })
        productList.forEach(e => {
            smStream.write({
                url: `/${e.type == 1 ? 'san-pham-don' : e.type == 2 ? 'san-pham-doi' : 'san-pham-tuy-bien'}/${e.slug}`,
                changefreq: 'daily',
                priority: 1, // A hint to the crawler that it should prioritize this over items less than 0.8
                img: (e.mediafiles.images || []).map(x => {
                    return {
                        url: x.mainImage,
                        title: e.productName,
                    }
                })
            })
        })
        // indicate there is nothing left to write
        smStream.end();
        const data = (await streamToPromise(smStream)).toString();
        const name = `products_${index + 1}`;
        const currentSitemap = await Sitemap.findOne({
            where: {
                name: name
            }
        })
        if (currentSitemap) {
            await currentSitemap.update({
                sitemap: data,
                urls: productList.map(e => `${process.env.WEB_PUBLIC_URL}/${e.type == 1 ? 'san-pham-don' : e.type == 2 ? 'san-pham-doi' : 'san-pham-tuy-bien'}/${e.slug}`),
                isAutoGen: true
            })
        } else
            currentSitemap = await Sitemap.create({
                name: name,
                link: process.env.WEB_PUBLIC_URL + '/sitemap/' + name + '.xml',
                sitemap: data,
                urls: productList.map(e => `${process.env.WEB_PUBLIC_URL}/${e.type == 1 ? 'san-pham-don' : e.type == 2 ? 'san-pham-doi' : 'san-pham-tuy-bien'}/${e.slug}`),
                isAutoGen: true
            });
        totalSitemap.push(currentSitemap.link)
    }
    return totalSitemap;
}

const generateBlogSitemap = async () => {
    const totalSitemap = [];
    const totalBlogList = await Blog.findAll({
        where: {
            status: Blog.STATUS.ACTIVE
        },
        order: [
            ['publishAt', 'ASC']
        ],
        include: [{
            model: BlogType,
            as: 'blogTypeInfo',
            attributes: ['slug'],
            include: [{
                model: BlogType,
                as: 'parent',
                attributes: ['slug'],
            }]
        }],
        attributes: ['title', 'slug'],
    });

    const listChunk = _.chunk(totalBlogList, 200);
    for (let [index, blogList] of listChunk.entries()) {
        const smStream = new SitemapStream({
            hostname: process.env.WEB_PUBLIC_URL,
            xmlns: { // trim the xml namespace
                news: false, // flip to false to omit the xml namespace for news
                xhtml: false,
                image: false,
                video: false
            }
        })
        // coalesce stream to value
        // alternatively you can pipe to another stream

        blogList.forEach(e => {
            smStream.write({
                url: `${e.blogTypeInfo ? (e.blogTypeInfo.parent ? `${e.blogTypeInfo.parent.slug}/${e.blogTypeInfo.slug}` : e.blogTypeInfo.slug) : ""}/${e.slug}`,
                changefreq: 'weekly',
            })
        })
        // indicate there is nothing left to write
        smStream.end();
        const data = (await streamToPromise(smStream)).toString();
        const name = `blogs_${index + 1}`;
        const currentSitemap = await Sitemap.findOne({
            where: {
                name: name
            }
        })
        if (currentSitemap) {
            await currentSitemap.update({
                sitemap: data,
                urls: blogList.map(e => `${process.env.WEB_PUBLIC_URL}/${e.blogTypeInfo ? (e.blogTypeInfo.parent ? `${e.blogTypeInfo.parent.slug}/${e.blogTypeInfo.slug}` : e.blogTypeInfo.slug) : ""}/${e.slug}`),
                isAutoGen: true
            })
        } else
            currentSitemap = await Sitemap.create({
                name: name,
                link: process.env.WEB_PUBLIC_URL + '/sitemap/' + name + '.xml',
                sitemap: data,
                urls: blogList.map(e => `${process.env.WEB_PUBLIC_URL}${e.blogTypeInfo ? (e.blogTypeInfo.parent ? `${e.blogTypeInfo.parent.slug}/${e.blogTypeInfo.slug}` : e.blogTypeInfo.slug) : ""}/${e.slug}`),
                isAutoGen: true
            });
        totalSitemap.push(currentSitemap.link)
    }
    return totalSitemap;
}

export const generateSitemapIndex = async (links) => {
    const smis = new SitemapIndexStream({
        level: 'warn'
    })
    for (let url of links) {
        smis.write({
            url: url
        })
    }
    smis.end();
    const data = (await streamToPromise(smis)).toString();
    await Sitemap.update({
        urls: links,
        sitemap: data
    }, {
        where: {
            id: 1
        }
    })
}

export const generateSitemap = async () => {
    // Sitemap generator
    // Remove all current sitemap autogen except 1st sitemap
    // Generate all product sitemap + blog
    // Regenerate mainsitemap
    // Generate all product
    const [productLinkSitemap, blogLinkSitemap, otherSitemap] = await Promise.all([
        generateProductSitemap(),
        generateBlogSitemap(),
        Sitemap.findAll({
            where: {
                isAutoGen: false
            },
            orrder: [
                ['id', 'ASC']
            ]
        })
    ]);
    const totalSitemap = _.concat(productLinkSitemap, blogLinkSitemap, otherSitemap.map(e => e.link));
    await Promise.all([generateSitemapIndex(totalSitemap), Sitemap.destroy({
        where: {
            link: {
                [Op.notIn]: totalSitemap
            },
            id: {
                [Op.not]: 1
            }
        }
    })])
}