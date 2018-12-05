import { SerializeField } from '../src/BinarySerializer';
import { TypeReflector } from '../src/TypeReflector';
import { TypeMetaClass } from '../src/TypeMetaClass';
import { DataType } from '../src/DataType';

class ClassB{
    @SerializeField(DataType.String)
    public str:string;
}
class ClassD{
    @SerializeField(DataType.String)
    public str:string;
}
class ClassC{
    @SerializeField(DataType.Float32)
    public num:number;
    @SerializeField(DataType.Object,false,ClassD)
    public d:ClassD;
}
class ClassA{
    @SerializeField(DataType.Object,false,ClassB)
    public b:ClassB;
    @SerializeField(DataType.String)
    public str:string;
    @SerializeField(DataType.Object,false,ClassC)
    public c:ClassC;
    @SerializeField(DataType.Float32)
    public num:number;
}

describe("type-meta-class",()=>{
    it("gather-all-meta-class",()=>{
        var a = new ClassA();
        var meta = TypeReflector.getMetaClass(ClassA.prototype);
        if(meta == null) return;
        let output: TypeMetaClass[] = [];
        TypeReflector.gatherAllMetaClass(meta,output);
    });
})
