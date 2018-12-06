import { TypeMetaProperty, TypeMetaClass } from "./TypeMetaClass";
import { DataType } from "./DataType";
import { TypeMetaClassMapping } from "./TypeMetaClassMapping";

export function SerializeField(type : DataType,array:boolean = false,ptype?:any) {
    return function (target : any, key : string) {
        TypeReflector.register(target, key, type,array,ptype);
    }
}

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

    public static getMetaClass(prototype : any,mapping?:TypeMetaClassMapping[]) : TypeMetaClass {
        let meta = TypeReflector.meta;
        for (var i = 0, len = meta.length; i < len; i++) {
            let m = meta[i];
            if (m.prototype === prototype) 
                if(mapping == null){
                    return m;
                }
                else{
                    return TypeReflector.getMetaClassWithMapping(m,mapping);
                }
            }
        return null;
    }

    private static getMetaClassByName(pname:string):TypeMetaClass{
        let meta = TypeReflector.meta;
        for (var i = 0, len = meta.length; i < len; i++) {
            let m = meta[i];
            if (m.protoName === pname) 
                return m;
            }
        return null;
    }

    private static getMetaClassWithMapping(tmc:TypeMetaClass,mapping:TypeMetaClassMapping[]):TypeMetaClass{
        let tmcconverted = {};
        let mappingLen = mapping.length;
        for(let i=0;i<mappingLen;i++){
            const map = mapping[i];
            let metaclass = TypeReflector.getMetaClassByName(map.pname);
            tmcconverted[map.pname] = metaclass.cloneSelf();
        }

        for(let i=0;i< mappingLen;i++){
            const map = mapping[i];
            const mappname = map.pname;
            let cmc:TypeMetaClass = tmcconverted[mappname];
            let omc = cmc.rawMetaClass;
            const mapp = map.property;
            for(let t=0,len = mapp.length;t<len;t++){
                const propname = mapp[t];
                let op = omc.getProperty(propname);
                if(op == null){
                    throw new Error(`can't find property:${propname} at ${omc.protoName}`);
                }
                if(op.datatype == DataType.Object){
                    cmc.properties.push(op.cloneWithPClass(tmcconverted[op.pclass.protoName]));
                }
                else{
                    cmc.properties.push(op);
                }
            }
        }
        return tmc;
    }

    public static gatherAllMetaClass(tmc:TypeMetaClass,output:TypeMetaClass[]){
        if(tmc ==null) return [];
        if(output.indexOf(tmc) >=0) return;
        tmc.sortProperty();
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
