
export module Variant{
    export const MAX_UINT:number = 1073741824;
    export const MAX_INT:number = 536870912;
    export const MIN_INT:number = -1073741824;
}
    

/**
 * max: 1<<30 1073741824
 * min: 0
 * @param v 
 */
export function EncodeVariant32Unsigned(v:number){
    let ret:number[] = [];
    const BYTE = 128;
    while(v >= BYTE){
        let b = (v & 0xFF) | BYTE;
        ret.push(b);
        v = (v >> 7);
    }
    ret.push(v);
    return ret;
}

export function DecodeVariant32Unsigned(data:number[]){
    let b = data[0];
    let index = 0;
    let ret = 0;
    while((b & 128) > 0){
        ret += (b & 127) << (index *7);
        index ++;
        b = data[index];
    }
    ret += (b & 127) <<(index * 7);
    return ret;
}

/**
 * max: 1<<29 536870912
 * min: -(1<<30) -1073741824
 * @param v 
 */
export function EncodeVariant32Signed(v:number){
    v = v >=0 ? v*2 : v*-2 -1;
    return EncodeVariant32Unsigned(v);
}

export function DecodeVariant32Signed(data:number[]){
    var v = DecodeVariant32Unsigned(data);
    return v & 1 ? (v+1) /-2 : v /2;
}
