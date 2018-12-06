import { DataType } from "./DataType";
import { TypeMetaClassMapping } from "./TypeMetaClassMapping";

export class TypeMetaProperty{
    public key:string;
    public datatype:DataType;
    public isArray:boolean = false;
    public pclass?:TypeMetaClass;

    public constructor(key:string,datatype:DataType,isary:boolean = false,pclass?:any){
        this.key= key;
        this.datatype = datatype;
        this.isArray =isary;
        this.pclass = pclass;
    }

    public cloneWithPClass(pclass:TypeMetaClass):TypeMetaProperty{
        return new TypeMetaProperty(this.key,this.datatype,this.isArray,pclass);
    }
}

function strcmp(a, b) {
    return (a < b? -1: (a > b? 1: 0));
}

export class TypeMetaClass{
    private m_pname:string;
    public properties : TypeMetaProperty[] = [];
    private m_proto:any;

    private m_raw:TypeMetaClass;
    public get rawMetaClass():TypeMetaClass { return this.m_raw;}

    public get prototype():any{ return this.m_proto;}
    public set prototype(p:any){
        this.m_proto = p;
    }

    public get protoName():string{ return this.m_pname;}

    public constructor(proto?:any){
        if(proto != null){
            this.prototype = proto;
        }
    }

    private m_needSort : boolean = true;

    public addProperty(tmp:TypeMetaProperty){
        
    }

    public getProperty(k:string){
        let p = this.properties;
        for (let i = 0, len = p.length; i < len; i++) {
            const pi = p[i];
            if (pi.key === k) 
                return pi;
        }
    }

    public sortProperty() {
        if (!this.m_needSort) 
            return;
        this.properties.sort((a, b) => strcmp(a, b));
        this.m_needSort = false;
        return this;
    }
    
    public cloneSelf():TypeMetaClass{
        let tmc= new TypeMetaClass(this.m_proto);
        tmc.m_needSort = false;
        tmc.m_raw = this;
        return tmc;
    }

}
