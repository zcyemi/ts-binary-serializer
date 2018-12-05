import { TypeMetaProperty, TypeMetaClass } from "./TypeMetaClass";
import { DataType } from "./DataType";

export class TypeReflector {

    public static meta : TypeMetaClass[] = [];
    public static register(proto : any, property : string, type : DataType,array:boolean =false,ptype?:any) {

        let metaclass = TypeReflector.getMetaClass(proto);
        if (metaclass == null) {
            metaclass = new TypeMetaClass();
            metaclass.prototype = proto;
            metaclass.properties = [];
            TypeReflector.meta.push(metaclass);
        }

        let mp = new TypeMetaProperty(property,type,array);
        if(type == DataType.Object){
            mp.pclass = <TypeMetaClass>TypeReflector.getMetaClass(ptype.prototype);
        }

        metaclass.properties.push(mp);
    }

    public static getMetaClass(prototype : any) : TypeMetaClass | null {
        let meta = TypeReflector.meta;
        for (var i = 0, len = meta.length; i < len; i++) {
            let m = meta[i];
            if (m.prototype === prototype) 
                return m;
            }
        return null;
    }

    public static gatherAllMetaClass(tmc:TypeMetaClass,output:TypeMetaClass[]){
        if(tmc ==null) return [];
        if(output.indexOf(tmc) >=0) return;
        output.push(tmc);
        let property = tmc.properties;
        for(let i=0,len =property.length;i<len;i++){
            let pclass = property[i].pclass;
            if(pclass != null){
                this.gatherAllMetaClass(pclass,output);
            }
        }
    }
}
