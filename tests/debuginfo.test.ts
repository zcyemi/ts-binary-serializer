import { SerializeField } from "../src/SerializeField";
import { DataType } from "../src/DataType";
import { BinarySerializer } from "../src/BinarySerializer";

class ClassDbgInfoTest{
    @SerializeField(DataType.String)
    public str:string = "Hello";
    @SerializeField(DataType.Int32)
    public num:Number = -20;
    @SerializeField(DataType.Float32,true)
    public numf:number[];
}

describe("debuginfo",()=>{

    it("case-1",()=>{

        var obj = new ClassDbgInfoTest();
        obj.numf = [43.1,-54.2,12,544,-544.3];
        var [data,dbginfo1] = BinarySerializer.SerializeWithDebugInfo(obj,ClassDbgInfoTest);
        var [objd,dbginfo2] = BinarySerializer.DeserializeWithDebugInfo(data,ClassDbgInfoTest);
    });
})
