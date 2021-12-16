import glob from 'glob';
import path from 'path';
import compose from 'koa-compose';

// We need to convert list of separated route in to the one
// The block below does dynamic import all routers inside current directory.
const routers = [];

glob.sync(path.join(__dirname, 'route*.[tj]s')).forEach((file)=> {
  const r = require(path.resolve(file)).default;
  routers.push(r);
});

// So we extract the middelware from router
const middleware = [];
routers.forEach((router) => {
  middleware.push(router.routes());
  middleware.push(router.allowedMethods());
});

// Then put them into one router. Magic here!
export default compose(middleware);