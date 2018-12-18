import { TypeReflector } from './TypeReflector';
import { BinaryBuffer } from './BinaryBuffer';
import { TypeMetaClass } from './TypeMetaClass';
import { BinaryBufferDebug, BinaryBufDbgInfo } from './BInaryBufferDebug';

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

    function preSerialize<T>(obj:T,type?:{new():T}):TypeMetaClass{
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
        return mc;
    }

    function preDeserialize<T>(type:new()=>T):[any,TypeMetaClass]{
        let obj = Object.create(type.prototype);
        let mc = TypeReflector.getMetaClass(type.prototype);
        if(mc == null){
            let msg= `reflect class ${type.prototype} invalid.`;
            throw new Error(msg);
        }
        mc.sortProperty();

        return [obj,mc];
    }

    export function Serialize<T>(obj:T,type?:{new():T}):ArrayBuffer{
        let mc = preSerialize(obj,type);
    
        let binarybuffer = BinaryBuffer.create();
        binarybuffer.serialize(mc,obj);
        return binarybuffer.m_arrayBuffer.buffer.slice(0,binarybuffer.pos);
    }

    export function SerializeWithDebugInfo<T>(obj:T,type?:{new():T}):[ArrayBuffer,BinaryBufDbgInfo]{
        let mc = preSerialize(obj,type);
        const buffer = BinaryBuffer.create();
        let binarybuffer:BinaryBuffer & BinaryBufferDebug = BinaryBufferDebug.Gen(buffer);
        binarybuffer.serialize(mc,obj);
        let arraybuf = binarybuffer.m_arrayBuffer.buffer.slice(0,binarybuffer.pos);
        return [arraybuf,binarybuffer.dbginfo];
    }

    export function Deserialize<T>(databuffer:ArrayBuffer,type:{new():T}):T{
        let [obj,mc] = preDeserialize(type);
        let binarybuffer = BinaryBuffer.createWithView(databuffer,0,databuffer.byteLength);
        return binarybuffer.deserialize(obj,mc);
    }

    export function DeserializeWithDebugInfo<T>(databuffer:ArrayBuffer,type:{new():T},serDbgInfo?:BinaryBufDbgInfo):[T,BinaryBufDbgInfo]{
        let [obj,mc] = preDeserialize(type);
        let buffer = BinaryBuffer.createWithView(databuffer,0,databuffer.byteLength);
        let binarybuffer = BinaryBufferDebug.Gen(buffer);
        try{
            let ret:T = binarybuffer.deserialize(obj,mc);
            return [ret,binarybuffer.dbginfo];
        }
        catch(e){
            if(serDbgInfo != null){
                serDbgInfo.verifyException(binarybuffer.dbginfo);
            }
            else{
                console.error(binarybuffer.dbginfo);
            }
            throw e;
        }
    }
    

}
