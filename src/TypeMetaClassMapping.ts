import { DataType } from "./DataType";
import { TypeMetaClass } from "./TypeMetaClass";
import { SerializeField } from "./TypeReflector";

export class TypeMetaClassMapping{
    @SerializeField(DataType.String)
    public pname:string;
    @SerializeField(DataType.String,true)
    public property:string[];
    
    public constructor(tmc:TypeMetaClass){
        tmc.sortProperty();
        this.pname = tmc.protoName;
        const prop = tmc.properties;
        let pv:string[] = new Array(prop.length);
        for(let i=0,len = prop.length;i<len;i++){
            pv[i] = prop[i].key;
        }
        this.property = pv;
    }
}
