/**
 * Created by yuanjianxin on 2018/4/9.
 */
const fs = require('fs');
const path = require('path');
const AsyncFunction = Object.getPrototypeOf(async() => {
}).constructor;

module.exports = {


    /**
     * 返回范围内的随机数
     * @param min
     * @param max
     * @returns {number}
     */
    rangeRandom(min, max){
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /**
     * 生成路由 koa-router
     * @param router
     * @param routers
     */
    generateRoutes(router, routers){
        const _pathSet = new Set();
        const _controllerMap = new Map();
        routers.forEach(v => {

            if (!v.path) throw new Error(`path is missing at routes:${JSON.stringify(v)}`);
            if (!v.method) throw new Error(`method is missing at routes:${JSON.stringify(v)}`);
            if (!v.controller) throw new Error(`controller is missing at routes:${JSON.stringify(v)}`);
            if (!v.func) throw new Error(`func is missing at routes:${JSON.stringify(v)}`);


            if (!['get', 'post', 'patch', 'head', 'delete', 'put'].includes(v.method.toLowerCase())) throw new Error(`method '${v.method}' is Invalid at routes:${JSON.stringify(v)}`);

            if (_pathSet.has(v.method + '|' + v.path)) throw new Error(`path '${v.path}' is already Exist!`);
            _pathSet.add(v.method + '|' + v.path);

            let _instance = _controllerMap.has(v.controller.name) && _controllerMap.get(v.controller.name) || new v.controller();
            _controllerMap.set(v.controller.name, _instance);

            let _func = _instance[v.func];
            if (!_func) throw new Error(`func is Invalid at routes:${JSON.stringify(v)}`);

            let __before = _instance.__before || null;
            let __after = _instance.__after || null;

            let _middleware = v.middleware || [];

            router[v.method](v.path, ..._middleware, async(ctx, next) => {
                __before && ( await __before.call(_instance, ctx, next));
                await _func.call(_instance, ctx, next);
                __after && (await __after.call(_instance, ctx, next));
            });
        })

        _pathSet.clear();
        _controllerMap.clear();
    },


    filePathIsExist(_path){
        return fs.existsSync(_path) || path.existsSync(_path);
    },

    generateMiddlewareFuncs(middlewarePath){
        if (middlewarePath == null)
            return [];
        if (!this.filePathIsExist(middlewarePath)) throw new Error(`==middleware path: ${middlewarePath} , no such file or directory==`);


        if (fs.statSync(middlewarePath).isFile()) {

            let module = require(middlewarePath);

            if (!(module instanceof Function)) throw new Error(`==middleware:${middlewarePath} should export function==`);

            if (module instanceof AsyncFunction)
                return [module];

            return [module()]
        }

        let files = fs.readdirSync(middlewarePath);
        files = files.map(v => path.resolve(path.join(middlewarePath, v)));
        let funcs = [];
        files.forEach(v => {
            let func = require(v);
            if (func instanceof AsyncFunction)
                funcs.push(func);
            if (func instanceof Function && !(func instanceof AsyncFunction))
                funcs.push(func());
        });
        return funcs;
    }

}