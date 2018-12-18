import * as chai from 'chai';
const {performance} = require('perf_hooks');

export function verfiy(obj1?:any,obj2?:any){
    if(obj1 == null || obj2== null){
        chai.expect(obj2).to.equal(obj1);
        return;
    }
    let t = typeof obj1;
    if(t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint'){
        chai.expect(obj1).to.eq(obj2);
    }
    for(var key in obj1){
        var val = obj1[key];
        if(typeof val === "number"){
            chai.expect(obj2[key]).to.closeTo(val,0.001);
        }
        else if(typeof val === "string"){
            chai.expect(obj2[key]).to.eq(val);
        }
        else if(typeof val === "object"){
            verfiy(obj2[key],val);
        }

    }
}


export function estimateTime(f:()=>any,times:number = 1):[number,...Array<any>]{
    let t1 = performance.now();
    let ret = null;
    for(let t=0;t<times;t++){
        ret = f();
    }
    let t2 = performance.now();
    return[t2 - t1,ret];
}
