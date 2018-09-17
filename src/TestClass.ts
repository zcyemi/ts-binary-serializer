import { TypeReflector, seralizeField, DataType } from "./BinarySeralize";

export class Vec2{
    @seralizeField(DataType.Float32)
    public x:number;
    @seralizeField(DataType.Float32)
    public y:number;
    public constructor(x:number,y:number){
        this.x = x;
        this.y = y;
    }
}

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

    @seralizeField(DataType.Object,false,Vec2)
    public vector:Vec2;

    @seralizeField(DataType.Object,true,Vec2)
    public vary:Vec2[];
}


