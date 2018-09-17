import { TypeReflector, seralizeField, DataType } from "./BinarySeralize";


export class TestClass{
    @seralizeField(DataType.String)
    public title:string;
    @seralizeField(DataType.Int8)
    public index:number;
    @seralizeField(DataType.Float32,true)
    public floatAry:number[];
    @seralizeField(DataType.Int16,true)
    public int16:number[];
    @seralizeField(DataType.String,true)
    public strlist:string[];
}

