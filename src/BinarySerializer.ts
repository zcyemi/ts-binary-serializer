import { TypeReflector } from './TypeReflector';
import { BinaryBuffer } from './BinaryBuffer';

export class BinarySerializeOptions{
    public includeEntryInfo:boolean = false
}

/**
 * @deprecated since v2.0, use BinarySerializer.Serialize instead
 * @param obj 
 * @param type 
 * @param options 
 */
export function BinarySerialize < T > (obj : T,type?:{new():T},options?:BinarySerializeOptions):ArrayBuffer{
    return BinarySerializer.Serialize(obj,type);
}

/**
 * @deprecated since v2.0, use BinarySerializer.Deserialize instead
 * @param type 
 * @param databuffer 
 */
export function BinaryDeserialize<T>(type:{new():T},databuffer:ArrayBuffer): T{
    return BinarySerializer.Deserialize(databuffer,type);
}


export module BinarySerializer{
    export function Serialize<T>(obj:T,type?:{new():T}):ArrayBuffer{
        let p = Object.getPrototypeOf(obj);
        if(p == null || p.constructor.name == "Object"){
            if(type == null){
                throw new Error('param type is required.');
            }
            p = type.prototype;
        }
        let mc = TypeReflector.getMetaClass(p);
        if (mc == null) {
            let msg:string = "reflect class: " + p.name +" invalid";
            throw new Error(msg);
        }
        mc.sortProperty();
    
        let binarybuffer = BinaryBuffer.create();
        binarybuffer.serialize(mc,obj);
        return binarybuffer.m_arrayBuffer.buffer.slice(0,binarybuffer.pos);
    }

    export function Deserialize<T>(databuffer:ArrayBuffer,type:{new():T}):T{
        let obj = Object.create(type.prototype);
        let mc = TypeReflector.getMetaClass(type.prototype);
        if(mc == null){
            let msg= `reflect class ${type.prototype} invalid.`;
            throw new Error(msg);
        }
        mc.sortProperty();

        let binarybuffer = BinaryBuffer.createWithView(databuffer,0,databuffer.byteLength);
        return binarybuffer.deserialize(obj,mc);
    }
}
