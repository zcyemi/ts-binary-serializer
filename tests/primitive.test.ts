import * as chai from 'chai';
import { BinarySerializer } from '../src/BinarySerializer';
import { Float16 } from '../src/Float16';
import { DataType } from '../src/DataType';
import { SerializeField } from '../src/SerializeField';

const expect = chai.expect;

class ClassA {
    @SerializeField(DataType.String)
    public mstr: string;
    @SerializeField(DataType.Bool)
    public mbool: boolean;
    @SerializeField(DataType.Float16)
    public mfloat16: number;
    @SerializeField(DataType.Float32)
    public mfloat32: number;
    @SerializeField(DataType.Float64)
    public mfloat64: number;
    @SerializeField(DataType.Int8)
    public mint8: number;
    @SerializeField(DataType.Int16)
    public mint16: number;
    @SerializeField(DataType.Int32)
    public mint32: number;
    @SerializeField(DataType.Uint8)
    public muint8: number;
    @SerializeField(DataType.Uint16)
    public muint16: number;
    @SerializeField(DataType.Uint32)
    public muint32: number;
}

describe('primitive-type', () => {
    let obja = new ClassA();
    obja.mbool = false;
    obja.mstr = "helloworld";
    obja.mfloat16 = 0.257;
    obja.mfloat32 = 0.1548221;
    obja.mfloat64 = 355461.4811137;
    obja.mint8 = -127;
    obja.muint8 = 255;
    obja.mint16 = -23324;
    obja.muint16 = 65535;
    obja.mint32 = -(1 << 16);
    obja.muint32 = 1 << 31 - 1;

    let buffer = BinarySerializer.Serialize(obja, ClassA);
    let objb = <ClassA>BinarySerializer.Deserialize(buffer, ClassA);

    it("bool", () => {
        expect(objb.mbool).to.eq(obja.mbool);
    })
    it("string", () => {
        expect(objb.mstr).to.eq(obja.mstr);
    })
    it("float16", () => {
        expect(objb.mfloat16).to.closeTo(obja.mfloat16, 0.001);
    })
    it("float32", () => {
        expect(objb.mfloat32).to.closeTo(obja.mfloat32, 0.0000001);
    })
    it("float64", () => {
        expect(objb.mfloat64).to.closeTo(obja.mfloat64, 0.000000000000001);
    })
    it("int8", () => {
        expect(objb.mint8).to.eq(obja.mint8);
    })
    it("int16", () => {
        expect(objb.mint16).to.eq(obja.mint16);
    })
    it("int32", () => {
        expect(objb.mint32).to.eq(obja.mint32);
    })
    it("uint8", () => {
        expect(objb.muint8).to.eq(obja.muint8);
    })
    it("uint16", () => {
        expect(objb.muint16).to.eq(obja.muint16);
    })
    it("uint32", () => {
        expect(objb.muint32).to.eq(obja.muint32);
    })
})

describe('float16', () => {
    var verify = function (b, tar) {
        let r = Float16.ByteToFloat16(b);
        let s = Float16.Float16ToByte(tar);
        expect(s).to.eq(b);
        if (tar === Infinity || tar === -Infinity) {
            expect(r).to.eq(tar);
        }
        else {
            expect(r).to.closeTo(tar, 0.001);
        }
    }
    it('testsample', () => {
        verify(0b0011110000000001, 1.0009765625);
        verify(0b1100000000000000, -2);
        verify(0b0111101111111111, 65504);
        verify(0b0011110000000000, 1);
        verify(0b1000000000000000, -0);
        verify(0b0111110000000000, Infinity);
        verify(0b1111110000000000, -Infinity);
        verify(0b0000000000000000, 0);
        verify(0b0000010000000000, 0.00006103515625);
        verify(0b0011010101010101, 0.333251953125);
        verify(0b0000001111111111, 0.00006097555160522461);
        verify(0b0000000000000001, 5.960464477539063e-8);
        verify(0b1011110000000001, -1.0009765625);
        verify(0b0100000000000000, 2);
        verify(0b1111101111111111, -65504);
        verify(0b1011110000000000, -1);
        verify(0b1000010000000000, -0.00006103515625);
        verify(0b1011010101010101, -0.333251953125);
        verify(0b1000001111111111, -0.00006097555160522461);
        verify(0b1000000000000001, -5.960464477539063e-8);
    })
})

class LargeData {
    @SerializeField(DataType.Float64, true)
    public numary: number[];
}

describe('large-data', () => {
    let data = new LargeData();
    let ary = new Array<number>();
    for (var i = 0; i < 300; i++) {
        ary.push(Math.random());
    }
    data.numary = ary;
    let serializedData = BinarySerializer.Serialize(data);
    let deserializeObj = <LargeData>BinarySerializer.Deserialize(serializedData, LargeData);
    let dary = deserializeObj.numary;

    it('large-array', () => {
        expect(dary.length).to.eq(ary.length);
        for (let i = 0, len = dary.length; i < len; i++) {
            expect(dary[i]).to.closeTo(ary[i], 0.000000001);
        }
    })
})

//----------------------

class AttatchType {
    @SerializeField(DataType.Float32)
    public num: number;
}

describe('attatch-type', () => {

    //prototype: [AttatchType]
    let obj1 = new AttatchType();
    obj1.num = 10;

    //prototype: [Object]
    let jstr = '{"num":10}';
    let obj2 = <AttatchType>JSON.parse(jstr);

    //prototype: [Object]
    let obj3 = { num: 10 };

    //prototype: null;
    let obj4 = Object.create(null);
    obj4.num = 10;

    //prototype: [AttatchType]
    let obj5 = {};
    Object.setPrototypeOf(obj5, Object.getPrototypeOf(new AttatchType()));
    obj5['num'] = 10;

    let d1 = <AttatchType>BinarySerializer.Deserialize(BinarySerializer.Serialize(obj1), AttatchType);
    let d2 = <AttatchType>BinarySerializer.Deserialize(BinarySerializer.Serialize(obj2, AttatchType), AttatchType);
    let d3 = <AttatchType>BinarySerializer.Deserialize(BinarySerializer.Serialize(obj3, AttatchType), AttatchType);
    let d4 = <AttatchType>BinarySerializer.Deserialize(BinarySerializer.Serialize(obj4, AttatchType), AttatchType);
    let d5 = <AttatchType>BinarySerializer.Deserialize(BinarySerializer.Serialize(obj5), AttatchType);

    it('new()', () => {
        expect(d1.num).to.eq(10);
    })
    it('json-parse', () => {
        expect(d2.num).to.eq(10);
    })
    it('anonymous-object', () => {
        expect(d3.num).to.eq(10);
    })
    it('object-create', () => {
        expect(d4.num).to.eq(10);
    })
    it('object-set-prototype', () => {
        expect(d5.num).to.eq(10);
    })
});

//-----------------------------------------------

class ClassWithArray {
    @SerializeField(DataType.Float32, true)
    public ary1: Array<number>;
    @SerializeField(DataType.Float32, true)
    public ary2: number[];
    @SerializeField(DataType.Float32, true)
    public emptyAry: number[];
    @SerializeField(DataType.Float32, true)
    public nullAry: number[];
}

describe("array", () => {

    let obj = new ClassWithArray();
    obj.ary1 = [10];
    obj.ary2 = [10];
    obj.emptyAry = [];

    let d = BinarySerializer.Serialize(obj);
    var d1 = <ClassWithArray>BinarySerializer.Deserialize(d, ClassWithArray);

    it('Array<T>', () => {
        expect(d1.ary1[0]).to.eq(10);
    })

    it('number[]', () => {
        expect(d1.ary2[0]).to.eq(10);
    })

    it('empty array', () => {
        expect(d1.emptyAry.length).to.eq(0);
    })

    it('null array', () => {
        expect(d1.nullAry).to.null;
    })

});

//-------------------------

class ClassWithTypedArray{
    @SerializeField(DataType.TypedArray,false,Uint8Array)
    public uint8:Uint8Array;
    @SerializeField(DataType.TypedArray,false,Uint16Array)
    public uint16:Uint16Array;
    @SerializeField(DataType.TypedArray,false,Uint32Array)
    public uint32:Uint32Array;
    @SerializeField(DataType.TypedArray,false,Int8Array)
    public int8:Int8Array;
    @SerializeField(DataType.TypedArray,false,Int16Array)
    public int16:Int16Array;
    @SerializeField(DataType.TypedArray,false,Int32Array)
    public int32:Int32Array;
    @SerializeField(DataType.TypedArray,false,Float32Array)
    public float32:Float32Array;
    @SerializeField(DataType.TypedArray,false,Float64Array)
    public float64:Float64Array;
    @SerializeField(DataType.TypedArray,true,Uint8Array)
    public arrayUint8Array:Uint8Array[];
}

describe("TypedArray",()=>{

    var uint8 = new Uint8Array([0,255]);
    var uint16 = new Uint16Array([65535,0,32767]);
    var uint32 =new Uint32Array([4294967295,0,4332])
    var int8= new Int8Array([-128,127,0])
    var int16 = new Int16Array([-32758,32767,0]);
    var int32 = new Int32Array([-2147483648,2147483647,0]);
    var float32 = new Float32Array([0.435,-546556.33,67663.2324443]);
    var float64 = new Float64Array([0.435,-546556.33,67663.2324443]);
    var arrayUint8Array = [new Uint8Array([0,255]),new Uint8Array([126,233])];
 

    var obj = new ClassWithTypedArray();
    obj.uint8 = uint8;
    obj.uint16 = uint16;
    obj.uint32 = uint32;
    obj.int8 = int8;
    obj.int16 = int16;
    obj.int32 = int32;
    obj.float32 = float32;
    obj.float64 = float64;
    obj.arrayUint8Array  = arrayUint8Array;

    var binarydata = BinarySerializer.Serialize(obj,ClassWithTypedArray);
    var newobj = BinarySerializer.Deserialize(binarydata,ClassWithTypedArray);

    it("uint8",()=>expectArrayBuffer(newobj.uint8,uint8));
    it("uint16",()=>expectArrayBuffer(newobj.uint16,uint16));
    it("uint32",()=>expectArrayBuffer(newobj.uint32,uint32));

    it("int8",()=>expectArrayBuffer(newobj.int8,int8));
    it("int16",()=>expectArrayBuffer(newobj.int16,int16));
    it("int32",()=>expectArrayBuffer(newobj.int32,int32));

    it("float32",()=>expectArrayBuffer(newobj.float32,float32));
    it("float64",()=>expectArrayBuffer(newobj.float64,float64));

    it("arrayUint8Array",()=>{
        expectArrayBuffer(newobj.arrayUint8Array[0],arrayUint8Array[0]);
        expectArrayBuffer(newobj.arrayUint8Array[1],arrayUint8Array[1]);
    })
})

type TypedArray =  Uint8Array | Uint16Array | Uint32Array | Int32Array | Int16Array | Int8Array | Float32Array | Float64Array;

function expectArrayBuffer(a:TypedArray,b:TypedArray) {
    let len = a.byteLength;

    var abuffer = a.buffer;
    var bbuffer = b.buffer;
    for(let t=0;t<len;t++){
        expect(abuffer[t]).eq(bbuffer[t]);
    }
}

// describe('benchmark', () => {

//     fs.readFile('./testdata/sample-data.json', (e, buffer) => {
//         let jsonstr = buffer.toString();
//         let t1 = performance.now();
//         let obj = JSON.parse(jsonstr);
//         console.log(`json deserialize: ${performance.now() - t1} ms`);

//         let t0 = performance.now();
//         let jstr = JSON.stringify(obj);
//         console.log(`json serialize: ${performance.now() - t0} ms`);

//         let jsonsize = buffer.byteLength;
//         console.log('json size: ' + jsonsize + " byte");

//         let datainfo: DataInfo = <DataInfo>obj;

//         let t2 = performance.now();
//         let serializedData = BinarySerialize(datainfo, DataInfo);
//         console.log(`binary serialize: ${performance.now() - t2} ms`);

//         let t3 = performance.now();
//         let obj1 = BinaryDeserialize(DataInfo, serializedData);
//         console.log(`binary deserialize: ${performance.now() - t3} ms`);

//         let binarysize = serializedData.byteLength;
//         console.log('binary size: ' + binarysize + " byte");
//         console.log('size save: ' + ((jsonsize - binarysize) / jsonsize));
//     });
// })

//--------------------------------------
