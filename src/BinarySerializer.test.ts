import * as chai from 'chai';
import * as fs from 'fs';
import {performance} from'perf_hooks';

import { SerializeField, DataType, BinarySerialize, BinaryDeserialize} from './BinarySerializer';

const expect = chai.expect;


class ClassA {
    @SerializeField(DataType.String)
    public mstr: string;
    @SerializeField(DataType.Bool)
    public mbool: boolean;
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
    obja.mfloat32 = 0.1548221;
    obja.mfloat64 = 355461.4811137;
    obja.mint8 = -127;
    obja.muint8 = 255;
    obja.mint16 = -23324;
    obja.muint16 = 65535;
    obja.mint32 = -(1 << 16);
    obja.muint32 = 1 << 31 - 1;

    let buffer = BinarySerialize(obja,ClassA);
    let objb = <ClassA>BinaryDeserialize(ClassA, buffer);

    it("bool", () => {
        expect(objb.mbool).to.eq(obja.mbool);
    })
    it("string", () => {
        expect(objb.mstr).to.eq(obja.mstr);
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
    let serializedData = BinarySerialize(data);
    let deserializeObj = <LargeData>BinaryDeserialize(LargeData, serializedData);
    let dary = deserializeObj.numary;

    it('large-array', () => {
        expect(dary.length).to.eq(ary.length);
        for (let i = 0, len = dary.length; i < len; i++) {
            expect(dary[i]).to.closeTo(ary[i], 0.000000001);
        }
    })
})

//----------------------

class AttatchType{
    @SerializeField(DataType.Float32)
    public num:number;
}

describe('attatch-type',()=>{

    //prototype: [AttatchType]
    let obj1 = new AttatchType();
    obj1.num= 10;

    //prototype: [Object]
    let jstr = '{"num":10}';
    let obj2 = <AttatchType>JSON.parse(jstr);

    //prototype: [Object]
    let obj3 = {num:10};

    //prototype: null;
    let obj4 = Object.create(null);
    obj4.num = 10;

    //prototype: [AttatchType]
    let obj5 = {};
    Object.setPrototypeOf(obj5,Object.getPrototypeOf(new AttatchType()));
    obj5['num'] = 10;

    let d1 = <AttatchType>BinaryDeserialize(AttatchType,BinarySerialize(obj1));
    let d2 = <AttatchType>BinaryDeserialize(AttatchType,BinarySerialize(obj2,AttatchType));
    let d3 = <AttatchType>BinaryDeserialize(AttatchType,BinarySerialize(obj3,AttatchType));
    let d4 = <AttatchType>BinaryDeserialize(AttatchType,BinarySerialize(obj4,AttatchType));
    let d5 = <AttatchType>BinaryDeserialize(AttatchType,BinarySerialize(obj5));

    it('new()',()=>{
        expect(d1.num).to.eq(10);
    })
    it('json-parse',()=>{
        expect(d2.num).to.eq(10);
    })
    it('anonymous-object',()=>{
        expect(d3.num).to.eq(10);
    })
    it('object-create',()=>{
        expect(d4.num).to.eq(10);
    })
    it('object-set-prototype',()=>{
        expect(d5.num).to.eq(10);
    })
});

//-----------------------------------------------

class ClassWithArray{
    @SerializeField(DataType.Float32,true)
    public ary1:Array<number>;
    @SerializeField(DataType.Float32,true)
    public ary2:number[];
    @SerializeField(DataType.Float32,true)
    public emptyAry:number[];
    @SerializeField(DataType.Float32,true)
    public nullAry:number[];
}


describe("array",()=>{

    let obj = new ClassWithArray();
    obj.ary1 = [10];
    obj.ary2 = [10];
    obj.emptyAry = [];

    let d = BinarySerialize(obj);
    var d1 = <ClassWithArray>BinaryDeserialize(ClassWithArray,d);

    it('Array<T>',()=>{
        expect(d1.ary1[0]).to.eq(10);
    })

    it('number[]',()=>{
        expect(d1.ary2[0]).to.eq(10);
    })

    it('empty array',()=>{
        expect(d1.emptyAry.length).to.eq(0);
    })
    
    it('null array',()=>{
        expect(d1.nullAry).to.null;
    })
    
});

//-------------------------------------------------

export class Vector2
{
    @SerializeField(DataType.Float32)
    x:number;
    @SerializeField(DataType.Float32)
    y:number;
}

export class Color
{
    @SerializeField(DataType.Float32)
    r:number;
    @SerializeField(DataType.Float32)
    g:number;
    @SerializeField(DataType.Float32)
    b:number;
    @SerializeField(DataType.Float32)
    a:number;
}

export class Sprite
{
    @SerializeField(DataType.String)
    public spriteName:string;
    @SerializeField(DataType.Object,false,Color)
    public spriteTint:Color;
    @SerializeField(DataType.Object,false,Vector2)
    public spritePivot:Vector2;
    @SerializeField(DataType.Bool)
    public flipX:boolean;
    @SerializeField(DataType.Bool)
    public flipY:boolean;
    @SerializeField(DataType.String)
    public maskBone:string;
}

export class Vector3
{
    @SerializeField(DataType.Float32)
    x:number;
    @SerializeField(DataType.Float32)
    y:number;
    @SerializeField(DataType.Float32)
    z:number;
}

class Bone
{
    @SerializeField(DataType.String)
    public name:string;
    @SerializeField(DataType.Object,false,Vector3)
    public position:Vector3;
    @SerializeField(DataType.Object,false,Vector3)
    public scale:Vector3;
    @SerializeField(DataType.Float32)
    public rotation:number;
    @SerializeField(DataType.Bool)
    public active:boolean;
    @SerializeField(DataType.Object,false,Sprite)
    public sprite:Sprite;

    public children:Array<string>;
}

export class Frame
{
    @SerializeField(DataType.Float32)
    public time:number;
    @SerializeField(DataType.Float32)
    public val:number;
    @SerializeField(DataType.String)
    public str:string;
}

export class Curve
{
    @SerializeField(DataType.String)
    public aim:string;
    @SerializeField(DataType.String)
    public type:string;
    @SerializeField(DataType.Object,true,Frame)
    public frames:Array<Frame>;

    private framesDic:{[key:number]:number|string} = {}
}

export class State
{
    @SerializeField(DataType.String)
    public name:string;
    @SerializeField(DataType.String)
    public aniName:string;
    @SerializeField(DataType.String,true)
    public nextStates:Array<string>;
}


export class Clip
{
    @SerializeField(DataType.String)
    public name:string;
    @SerializeField(DataType.Object,true,Curve)
    public curves:Array<Curve>;
    @SerializeField(DataType.Int16)
    private frameCount:number;

}

export class Animation
{
    @SerializeField(DataType.Object,true,Clip)
    public animClips:Array<Clip>;
    @SerializeField(DataType.Object,true,State)
    public states:Array<State>;
}

export class DataInfo
{
    @SerializeField(DataType.String)
    public rootBone:string;
    @SerializeField(DataType.Object,true,Bone)
    public bones:Array<Bone>;
    @SerializeField(DataType.Object,false,Animation)
    public anim:Animation;
}


describe('benchmark',()=>{

    fs.readFile('./testdata/sample-data.json',(e,buffer)=>{
        let jsonstr = buffer.toString();
        let t1= performance.now();
        let obj = JSON.parse(jsonstr);
        console.log(`json deserialize: ${performance.now() -t1} ms`);

        let jsonsize = buffer.byteLength;
        console.log('json size: ' + jsonsize +" byte");

        let datainfo:DataInfo = <DataInfo> obj;
        let serializedData = BinarySerialize(datainfo,DataInfo);
        let t2 = performance.now();
        let obj1 = BinaryDeserialize(DataInfo,serializedData);
        console.log(`binary deserialize: ${performance.now() -t2} ms`);

        let binarysize = serializedData.byteLength;
        console.log('binary size: '+ binarysize +" byte");
        console.log('size save: '+ ((jsonsize - binarysize)/ jsonsize));

    });


})

//--------------------------------------