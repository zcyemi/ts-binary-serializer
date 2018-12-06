import { DataType } from '../src/DataType';
import { SerializeField } from '../src/TypeReflector';
import { BinarySerialize, BinaryDeserialize } from '../src/BinarySerializer';

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
        a.num=2;
        a.str = "c";
        a.b = {str:"xxx"};
        a.c = {num:10,d:null};

        var d = BinarySerialize(a,ClassA,{includeEntryInfo:true});
        var ad = BinaryDeserialize(ClassA,d);
        var dn = BinarySerialize(a,ClassA,{includeEntryInfo:false});
        var adn = BinaryDeserialize(ClassA,dn);

        console.log(d);
        console.log(dn);

        console.log(ad);
        console.log(adn);
        
        
    });
})
