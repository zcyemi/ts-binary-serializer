import { TypeReflector } from './TypeReflector';
import { BinaryBuffer } from './BinaryBuffer';
import { TypeMetaClass } from './TypeMetaClass';
import { BinaryBufferDebug, BinaryBufDbgInfo } from './BInaryBufferDebug';

export class BinarySerializeOptions{
    public fastUTF8string?:boolean = true;
}

export class BinaryDeserializeOptions{
    public fastUTF8string?:boolean = true;
    public serializeDbgInfo?:BinaryBufDbgInfo;
}

/**
 * @deprecated since v2.0, use BinarySerializer.Serialize instead
 * @param obj 
 * @param type 
 * @param options 
 */
export function BinarySerialize < T > (obj : T,type?:{new():T}):ArrayBuffer{
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

    export function Serialize<T>(obj:T,type?:{new():T},options?:BinarySerializeOptions):ArrayBuffer{
        let mc = preSerialize(obj,type);
        if(options == null) options = new BinaryDeserializeOptions();
    
        let binarybuffer = BinaryBuffer.create(options);
        binarybuffer.serialize(mc,obj);
        return binarybuffer.m_arrayBuffer.buffer.slice(0,binarybuffer.pos);
    }

    export function SerializeWithDebugInfo<T>(obj:T,type?:{new():T},options?:BinarySerializeOptions):[ArrayBuffer,BinaryBufDbgInfo]{
        let mc = preSerialize(obj,type);
        if(options == null) options = new BinaryDeserializeOptions();

        const buffer = BinaryBuffer.create(options);
        let binarybuffer:BinaryBuffer & BinaryBufferDebug = BinaryBufferDebug.Gen(buffer);
        binarybuffer.serialize(mc,obj);
        let arraybuf = binarybuffer.m_arrayBuffer.buffer.slice(0,binarybuffer.pos);
        return [arraybuf,binarybuffer.dbginfo];
    }

    export function Deserialize<T>(databuffer:ArrayBuffer,type:{new():T},options?:BinaryDeserializeOptions):T{
        let [obj,mc] = preDeserialize(type);
        if(options == null) options = new BinaryDeserializeOptions();

        let binarybuffer = BinaryBuffer.createWithView(databuffer,0,databuffer.byteLength,options);
        return binarybuffer.deserialize(obj,mc);
    }

    export function DeserializeWithDebugInfo<T>(databuffer:ArrayBuffer,type:{new():T},options?:BinaryDeserializeOptions):[T,BinaryBufDbgInfo]{
        let [obj,mc] = preDeserialize(type);
        if(options == null) options = new BinaryDeserializeOptions();
        
        let buffer = BinaryBuffer.createWithView(databuffer,0,databuffer.byteLength,options);
        let binarybuffer = BinaryBufferDebug.Gen(buffer);
        try{
            let ret:T = binarybuffer.deserialize(obj,mc);
            return [ret,binarybuffer.dbginfo];
        }
        catch(e){
            if(options.serializeDbgInfo != null){
                options.serializeDbgInfo.verifyException(binarybuffer.dbginfo);
            }
            else{
                console.error(binarybuffer.dbginfo);
            }
            throw e;
        }
    }
}
