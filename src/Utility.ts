

export function Extends<T>(obj:any,t:new()=>T):any{
    let tar = new t();

    for (const key in tar) {
        const p = obj[key];
        if(p != undefined) return;
        const pt = tar[key];
        if(typeof pt === 'function'){
            obj[key] = pt.bind(obj);
        }
        else{
            obj[key] = pt;
        }
    }

    return obj;
}
