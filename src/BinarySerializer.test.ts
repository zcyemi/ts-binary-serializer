import * as chai from 'chai';

import { seralizeField, DataType, BinarySerialize, BinaryDeserialize} from './BinarySerializer';

const expect = chai.expect;

class ClassA{
    @seralizeField(DataType.String)
    public mstr:string;
    @seralizeField(DataType.Bool)
    public mbool:boolean;
    @seralizeField(DataType.Float32)
    public mfloat32:number;
    @seralizeField(DataType.Float64)
    public mfloat64:number;
    @seralizeField(DataType.Int8)
    public mint8:number;
    @seralizeField(DataType.Int16)
    public mint16:number;
    @seralizeField(DataType.Int32)
    public mint32:number;
    @seralizeField(DataType.Uint8)
    public muint8:number;
    @seralizeField(DataType.Uint16)
    public muint16:number;
    @seralizeField(DataType.Uint32)
    public muint32:number;
}

describe('serializer',()=>{
    let obja = new ClassA();
    obja.mbool = false;
    obja.mstr = "helloworld";
    obja.mfloat32 = 0.1548221;
    obja.mfloat64 = 355461.4811137;
    obja.mint8 = -127;
    obja.muint8 = 255;
    obja.mint16 = -23324;
    obja.muint16 = 65535;
    obja.mint32 = -(1<<16);
    obja.muint32 = 1<<31-1;

    let buffer = BinarySerialize(obja);
    let objb = <ClassA>BinaryDeserialize(ClassA,buffer);
    it("bool",()=>{
        expect(objb.mbool).to.eq(obja.mbool);
    })
    it("string",()=>{
        expect(objb.mstr).to.eq(obja.mstr);
    })
    it("float32",()=>{
        expect(objb.mfloat32).to.closeTo(obja.mfloat32,0.0000001);
    })
    it("float64",()=>{
        expect(objb.mfloat64).to.closeTo(obja.mfloat64,0.000000000000001);
    })
    it("int8",()=>{
        expect(objb.mint8).to.eq(obja.mint8);
    })
    it("int16",()=>{
        expect(objb.mint16).to.eq(obja.mint16);
    })
    it("int32",()=>{
        expect(objb.mint32).to.eq(obja.mint32);
    })
    it("uint8",()=>{
        expect(objb.muint8).to.eq(obja.muint8);
    })
    it("uint16",()=>{
        expect(objb.muint16).to.eq(obja.muint16);
    })
    it("uint32",()=>{
        expect(objb.muint32).to.eq(obja.muint32);
    })
})

