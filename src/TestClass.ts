import { TypeReflector, seralizeField, DataType } from "./BinarySeralize";


export class TestClass{
    @seralizeField(DataType.String)
    public title:string;
    @seralizeField(DataType.Int8)
    public index:number;
    @seralizeField(DataType.Float32,true)
    public floatAry:number[];
}

