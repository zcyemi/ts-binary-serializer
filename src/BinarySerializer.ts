import { TextDecoder,TextEncoder} from 'text-encoding';

function strcmp(a, b) {
    return (a < b? -1: (a > b? 1: 0));
}

export enum DataType {
    Null,
    Float32,
    Float64,
    Int32,
    Int16,
    Int8,
    Uint32,
    Uint16,
    Uint8,
    String,
    Bool,
    Object
}

export class TypeMetaProperty{
    public key:string;
    public datatype:DataType;
    public isArray:boolean = false;
    public pclass?:TypeMetaClass;

    public constructor(key:string,datatype:DataType,isary:boolean = false,pclass?:any){
        this.key= key;
        this.datatype = datatype;
        this.isArray =isary;
        this.pclass = pclass;
    }
}

export class TypeMetaClass {
    public prototype : any;
    public properties : TypeMetaProperty[]

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

    public sortProperty() {
        if (!this.m_needSort) 
            return;
        this
            .properties
            .sort((a, b) => strcmp(a, b));
        this.m_needSort = false;
        return this;
    }
}

export function SerializeField(type : DataType,array:boolean = false,ptype?:any) {
    return function (target : any, key : string) {
        TypeReflector.register(target, key, type,array,ptype);
    }
}


export class TypeReflector {

    public static meta : TypeMetaClass[] = [];
    public static register(proto : any, property : string, type : DataType,array:boolean =false,ptype?:any) {

        let metaclass = TypeReflector.getMetaClass(proto);
        if (metaclass == null) {
            metaclass = new TypeMetaClass();
            metaclass.prototype = proto;
            metaclass.properties = [];
            TypeReflector.meta.push(metaclass);
        }

        let mp = new TypeMetaProperty(property,type,array);
        if(type == DataType.Object){
            let t= new ptype();
            mp.pclass = <TypeMetaClass>TypeReflector.getMetaClass(Object.getPrototypeOf(t));
        }

        metaclass.properties.push(mp);
    }

    public static getMetaClass(prototype : any) : TypeMetaClass | null {
        let meta = TypeReflector.meta;
        for (var i = 0, len = meta.length; i < len; i++) {
            let m = meta[i];
            if (m.prototype === prototype) 
                return m;
            }
        return null;
    }
}

class BinaryBuffer {
    public m_arrayBuffer : Uint8Array;
    private static readonly DEFAULT_BUFFER_SIZE: number = 512;
    private m_arrayBufferCurrentSize:number = BinaryBuffer.DEFAULT_BUFFER_SIZE;
    private m_view : DataView;
    private m_pos : number = 0;
    public static EncoderUTF8 : TextEncoder = new TextEncoder();
    public static DecoderUTF8 : TextDecoder = new TextDecoder();
    private constructor() {}

    private static WriteFuncMap:{[t:number]:string} ={};
    private static ReadFuncMap:{[t:number]:string} = {};


    public static initialize(){
        for(var t in DataType){
            if(!isNaN(Number(t))) continue;
            let v = DataType[t];
            this.WriteFuncMap[v] = "write" + t;
            this.ReadFuncMap[v] = "read" + t;
        }
    }

    public get pos():number{
        return this.m_pos;
    }

    public static create() : BinaryBuffer {
        let buffer = new BinaryBuffer();
        let uint8ary = new Uint8Array(BinaryBuffer.DEFAULT_BUFFER_SIZE);
            buffer.m_arrayBuffer = uint8ary;
            buffer.m_view = new DataView(uint8ary.buffer);
        return buffer;
    }

    public checkBufferExten(appendSize:number = 8){
        let cursize = this.m_arrayBufferCurrentSize;
        if(this.m_pos + appendSize >= cursize){
            let tarsize = cursize + appendSize;
            while(cursize < tarsize){
                cursize = cursize <<1;
            }
            let curbuf = this.m_arrayBuffer;
            let newbuf = new Uint8Array(cursize);
            newbuf.set(curbuf,0);
            this.m_arrayBuffer = newbuf;
            this.m_arrayBufferCurrentSize = cursize;
            this.m_view = new DataView(newbuf.buffer,0,cursize);
        }
    }

    public static createWithView(arybuffer:ArrayBuffer,offset:number,bytesize:number):BinaryBuffer{
        let buffer = new BinaryBuffer();
        buffer.m_arrayBuffer = new Uint8Array(arybuffer);
        buffer.m_view = new DataView(arybuffer,offset,bytesize);
        buffer.m_pos = offset;

        return buffer;
    }

    public pushProperty(type : DataType, val : any,isary = false,tmc?:TypeMetaClass) {
        if (val == null) {
            this.writeType(DataType.Null);
            return;
        }
        this.writeType(type);
        let f:(v:any)=>void =this[BinaryBuffer.WriteFuncMap[type]];
        if(f == null){
            console.log(type);
        }
        let isobj = type == DataType.Object;
        if(!isary){
            isobj? f.call(this,val,tmc): f.call(this,val);
            return;
        }
        if(!Array.isArray(val)){
            let msg = `target property: ${val} is not an array.`;
            throw new Error(msg);
        }
        let ary = <Array<any>>val;
        
        let arylen = ary.length;
        this.writeUint16(arylen);

        if(type != DataType.Object && type != DataType.String){
            this.checkBufferExten(arylen *8);
        }

        if(isobj){
            for(let i=0;i<arylen;i++){
                f.call(this,ary[i],tmc);
            }
        }
        else{
            for(let i=0;i<arylen;i++){
                f.call(this,ary[i]);
            }
        }
    }

    public readProperty(type : DataType,isary= false,tmc?:TypeMetaClass) : any {
        let t = this.readType();
        if (t == DataType.Null) 
            return null;
        if (t != type) 
            throw new Error("data type mismatch "+ t +" "+ type);
        let f:(v:any)=>void = this[BinaryBuffer.ReadFuncMap[type]];
        let isobj = type == DataType.Object;
        if(f == null){
            console.log(type);
        }

        if(!isary){
            return isobj? f.call(this,tmc): f.call(this);
        }

        let arylen = this.readUint16();
        if(arylen == 0) return [];

        let ary:any[] = [];
        if(isobj){
            for(let i=0;i<arylen;i++){
                ary.push(f.call(this,tmc));
            }
        }
        else{
            for(let i=0;i<arylen;i++){
                ary.push(f.call(this));
            }
        }

        return ary;
    }

    public writeFloat32(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setFloat32(p, v);
        this.m_pos += 4;
    }
    public readFloat32() : number {
        let view = this.m_view;
        let ret = view.getFloat32(this.m_pos);
        this.m_pos += 4;
        return ret;
    }
    public writeFloat64(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setFloat64(p, v);
        this.m_pos += 8;
    }
    public readFloat64() : number {
        let view = this.m_view;
        let ret = view.getFloat64(this.m_pos);
        this.m_pos += 8;
        return ret;
    }

    public writeInt8(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setInt8(p, v);
        this.m_pos++;
    }
    public readInt8() : number {
        let view = this.m_view;
        let ret = view.getInt8(this.m_pos);
        this.m_pos += 1;
        return ret;
    }
    public writeUint8(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setUint8(p, v);
        this.m_pos++;
    }
    public readUint8() : number {
        let view = this.m_view;
        let ret = view.getUint8(this.m_pos);
        this.m_pos += 1;
        return ret;
    }
    public writeInt16(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setInt16(p, v);
        this.m_pos += 2;
    }
    public readInt16() : number {
        let view = this.m_view;
        let ret = view.getInt16(this.m_pos);
        this.m_pos += 2;
        return ret;
    }
    public writeUint16(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setUint16(p, v);
        this.m_pos += 2;
    }
    public readUint16() : number {
        let view = this.m_view;
        let ret = view.getUint16(this.m_pos);
        this.m_pos += 2;
        return ret;
    }
    public writeInt32(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setInt32(p, v);
        this.m_pos += 4;
    }
    public readInt32() : number {
        let view = this.m_view;
        let ret = view.getInt32(this.m_pos);
        this.m_pos += 4;
        return ret;
    }
    public writeUint32(v : number) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setUint32(p, v);
        this.m_pos += 4;
    }
    public readUint32() : number {
        let view = this.m_view;
        let ret = view.getUint32(this.m_pos);
        this.m_pos += 4;
        return ret;
    }
    public writeBool(b : boolean) {
        let view = this.m_view;
        let p = this.m_pos;
        view.setUint8(p, b
            ? 1
            : 0);
        this.m_pos++;
    }
    public readBool() : boolean {
        let view = this.m_view;
        let ret = view.getUint8(this.m_pos);
        this.m_pos++;
        return ret == 1;
    }

    public writeString(s : string) {
        if (s === '' || s == null) {
            this.writeUint16(0);
            return;
        }
        let encoder = BinaryBuffer.EncoderUTF8;
        let ary = encoder.encode(s);
        let len = ary.byteLength;
        if (len >= 65535) 
            throw new Error('string length exceed!');
        this.writeUint16(len);
        this.checkBufferExten(len);
        let buf = this.m_arrayBuffer;
        buf.set(ary, this.m_pos);
        this.m_pos += len;
    }

    public readString() {
        let len = this.readUint16();
        if (len == 0) 
            return null;
        let decoder = BinaryBuffer.DecoderUTF8;
        let ary = new DataView(this.m_arrayBuffer.buffer, this.m_pos, len);
        let str = decoder.decode(ary);
        this.m_pos += len;
        return str;
    }

    public writeType(t : DataType) {
        this.writeUint8(t);
    }

    public readType() : DataType {
        let ret = this.readUint8();
        return ret;
    }

    public writeObject(o:any,tmc:TypeMetaClass){
        if(o == null){
            this.writeUint16(0);
            return;
        }
        let buffer = BinarySeralizer.serialize(tmc,o);
        let len = buffer.byteLength;
        this.writeInt16(len);
        this.checkBufferExten(len);
        this.m_arrayBuffer.set(new Uint8Array(buffer,0,len),this.m_pos);
        this.m_pos += len;
    }

    public readObject(tmc:TypeMetaClass){
        let len = this.readUint16();
        if(len ==0) return null;
        let pos = this.m_pos;
        let arybuffer = this.m_arrayBuffer.buffer.slice(pos,pos + len);
        let ret = BinarySeralizer.deserializeWidthMeta(tmc,arybuffer,0,len);
        this.m_pos += len;
        return ret;
    }
}
BinaryBuffer.initialize();


class BinarySeralizer {
    public static serialize <T> (mc : TypeMetaClass, obj : T):ArrayBuffer{
        let properties = mc.properties;

        let binarybuffer = BinaryBuffer.create();
        for(let i=0,len = properties.length;i<len;i++){
            let p = properties[i];
            binarybuffer.pushProperty(p.datatype,obj[p.key],p.isArray,p.pclass);
        }
        return binarybuffer.m_arrayBuffer.buffer.slice(0,binarybuffer.pos);
    }

    public static deserialize<T>(tar:T,mc:TypeMetaClass,buffer:ArrayBuffer):T | null{
        let properties = mc.properties;
        let binarybuffer = BinaryBuffer.createWithView(buffer,0,buffer.byteLength);
        for(let i=0,len= properties.length;i<len;i++){
            let p = properties[i];
            var val = binarybuffer.readProperty(p.datatype,p.isArray,p.pclass);
            tar[p.key] = val;
        }
        return tar;
    }

    public static deserializeWidthMeta(mc:TypeMetaClass,buffer:ArrayBuffer,offset:number,size:number): any| null{
        let properties = mc.properties;
        let proto = mc.prototype;
        let tar = Object.create(proto);
        let binarybuffer = BinaryBuffer.createWithView(buffer,offset,size);
        for(let i=0,len= properties.length;i<len;i++){
            let p = properties[i];
            var val = binarybuffer.readProperty(p.datatype,p.isArray);
            tar[p.key] = val;
        }
        return tar;
    }
}

export function BinarySerialize < T > (obj : T,type?:{new():T}):ArrayBuffer{
    let p = Object.getPrototypeOf(obj);
    if(p == null || p.constructor.name == "Object"){
        if(type == null){
            throw new Error('param type is required.');
        }
        let o = new type();
        p = Object.getPrototypeOf(o);
    }
    let mc = TypeReflector.getMetaClass(p);
    if (mc == null) {
        let msg:string = "reflect class: " + p.name +" invalid";
        throw new Error(msg);
    }
    mc.sortProperty();
    return BinarySeralizer.serialize(mc,obj);
}

export function BinaryDeserialize<T>(type:{new():T},databuffer:ArrayBuffer): T |null{
    let obj = new type();
    let p = Object.getPrototypeOf(obj);
    let mc = TypeReflector.getMetaClass(p);
    if(mc == null) throw new Error(`reflect class ${p} invalid.`);
    mc.sortProperty();
    return BinarySeralizer.deserialize(obj,mc,databuffer);

}