import { TypeReflector } from './TypeReflector';
import { DataType } from './DataType';
import { BinaryBuffer } from './BinaryBuffer';





export class BinarySerializeOptions{
    public includeEntryInfo:boolean = false
}

export function BinarySerialize < T > (obj : T,type?:{new():T},options?:BinarySerializeOptions):ArrayBuffer{
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

export function BinaryDeserialize<T>(type:{new():T},databuffer:ArrayBuffer): T |null{
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
