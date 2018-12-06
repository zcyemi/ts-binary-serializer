import { DataType } from "./DataType";


export class TypeMetaProperty{
    public key:string;
    public datatype:DataType;
    public isArray:boolean = false;
    public pclass?:TypeMetaClass | DataType;

    public constructor(key:string,datatype:DataType,isary:boolean = false,pclass?:any){
        this.key= key;
        this.datatype = datatype;
        this.isArray =isary;
        this.pclass = pclass;
    }
}

function strcmp(a, b) {
    return (a < b? -1: (a > b? 1: 0));
}

export class TypeMetaClass {
    public get prototype() : any{
        return this.m_prototype;
    }

    public set prototype(v:any){
        this.m_prototype = v;
        this.pname = this.protoName;
    }
    private m_prototype:any;
    public properties : TypeMetaProperty[]

    public pname:string;

    private m_needSort : boolean = true;

    public addProperty(k : string, t : DataType,isary:boolean =false) {
        let p = this.properties;
        for (let i = 0, len = p.length; i < len; i++) {
            if (p[i].key == k) 
                return;
            }
        p.push(new TypeMetaProperty(k,t,isary));
        this.m_needSort = true;
    }

    public get protoName():string{
        return this.prototype.constructor.name;
    }

    public sortProperty() {
        if (!this.m_needSort) 
            return;
        this.properties.sort((a, b) => strcmp(a, b));
        this.m_needSort = false;
        return this;
    }


}
