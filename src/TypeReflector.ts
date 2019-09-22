import { TypeMetaProperty, TypeMetaClass } from "./TypeMetaClass";
import { DataType } from "./DataType";




export class TypeReflector {

    public static meta : TypeMetaClass[] = [];

    public static registerInternal(type:any){

        var prototype = type.prototype;
        let meta = TypeReflector.meta;
        for (var i = 0, len = meta.length; i < len; i++) {
            let m = meta[i];
            if (m.prototype === prototype){
                return;
            }
        }

        var metaclass = new TypeMetaClass();
        metaclass.prototype = prototype;
        TypeReflector.meta.push(metaclass);
    }

    public static register(proto : any, property : string, type : DataType,array:boolean =false,ptype?:any) {
        let metaclass = TypeReflector.getMetaClass(proto);
        if (metaclass == null) {
            metaclass = new TypeMetaClass();
            metaclass.prototype = proto;
            metaclass.properties = [];
            TypeReflector.meta.push(metaclass);
        }

        let mp = new TypeMetaProperty(property,type,array);
        if(type == DataType.Object || type == DataType.Map){
            if( typeof ptype === "number"){
                if(ptype == DataType.Null || ptype == DataType.Object || ptype == DataType.Map){
                    throw new Error("invalid pclass for object/map");
                }
                mp.pclass = ptype;
            }
            else{
                mp.pclass = <TypeMetaClass>TypeReflector.getMetaClass(ptype.prototype);
            }
        }
        else if(type == DataType.TypedArray){
            mp.pclass = <TypeMetaClass>TypeReflector.getMetaClass(ptype.prototype);
        }

        metaclass.properties.push(mp);
    }

    public static getMetaClass(prototype : any) : TypeMetaClass | null {
        let meta = TypeReflector.meta;
        for (var i = 0, len = meta.length; i < len; i++) {
            let m = meta[i];
            if (m.prototype === prototype){
                return m;
            }
        }
        return null;
    }
}

TypeReflector.registerInternal(Uint8Array);
TypeReflector.registerInternal(Uint16Array);
TypeReflector.registerInternal(Uint32Array);
TypeReflector.registerInternal(Int8Array);
TypeReflector.registerInternal(Int16Array);
TypeReflector.registerInternal(Int32Array);
TypeReflector.registerInternal(Float32Array);
TypeReflector.registerInternal(Float64Array);