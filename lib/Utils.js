/**
 * Created by yuanjianxin on 2018/4/9.
 */
module.exports={


    /**
     * 返回范围内的随机数
     * @param min
     * @param max
     * @returns {number}
     */
    rangeRandom(min,max){
        return Math.floor(Math.random()*(max-min+1)+min);
    },

    /**
     * 生成路由 koa-router
     * @param router
     * @param routers
     */
    generateRoutes(router,routers){
        const _pathSet=new Set();
        const _controllerMap=new Map();
        routers.forEach(v=>{

            if(!v.path) throw new Error(`path is missing at routes:${JSON.stringify(v)}`);
            if(!v.method) throw new Error(`method is missing at routes:${JSON.stringify(v)}`);
            if(!v.controller) throw new Error(`controller is missing at routes:${JSON.stringify(v)}`);
            if(!v.func) throw new Error(`func is missing at routes:${JSON.stringify(v)}`);


            if(!['get','post','patch','head','delete','put'].includes(v.method.toLowerCase())) throw new Error(`method '${v.method}' is Invalid at routes:${JSON.stringify(v)}`);

            if(_pathSet.has(v.path)) throw new Error(`path '${v.path}' is already Exist!`);
            _pathSet.add(v.path);

            let _instance=_controllerMap.has(v.controller.name) && _controllerMap.get(v.controller.name) || new v.controller();
            _controllerMap.set(v.controller.name,_instance);

            let _func=_instance[v.func];
            if(!_func) throw new Error(`func is Invalid at routes:${JSON.stringify(v)}`);

            let __before=_instance.__before || null;
            let __after=_instance.__after || null;

            router[v.method](v.path,async (ctx,next)=>{
                __before && ( await __before.call(_instance,ctx,next));
                await _func.call(_instance,ctx,next);
                __after && (await __after.call(_instance,ctx,next));
            });
        })

        _pathSet.clear();
        _controllerMap.clear();
    },
}