import * as chai from 'chai';

export function verfiy(obj1?:object,obj2?:object){
    if(obj1 == null || obj2== null){
        chai.expect(obj2).to.equal(obj1);
        return;
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
