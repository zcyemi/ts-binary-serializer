import { TextDecoder,TextEncoder} from 'text-encoding';

function strcmp(a, b) {
    return (a < b
        ? -1
        : (a > b
            ? 1
            : 0));
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

    public constructor(key:string,datatype:DataType,isary:boolean = false){
        this.key= key;
        this.datatype = datatype;
        this.isArray =isary;
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

export class TypeReflector {

    public static meta : TypeMetaClass[] = [];
    public static register(proto : any, property : string, type : DataType,array:boolean =false) {

        let metaclass = TypeReflector.getMetaClass(proto);
        if (metaclass == null) {
            metaclass = new TypeMetaClass();
            metaclass.prototype = proto;
            metaclass.properties = [];
            TypeReflector
                .meta
                .push(metaclass);
        }

        metaclass
            .properties
            .push(new TypeMetaProperty(property,type,array));
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
            this.WriteFuncMap[v] = "write"+t;
            this.ReadFuncMap[v] = "read"+t;
        }
    }

    public get pos():number{
        return this.m_pos;
    }

    public static create(data? : Uint8Array) : BinaryBuffer {
        let buffer = new BinaryBuffer();
        if (data == null) {
            let uint8ary = new Uint8Array(512);
            buffer.m_arrayBuffer = uint8ary;
            buffer.m_view = new DataView(uint8ary.buffer);
        } else {
            buffer.m_arrayBuffer = data;
            buffer.m_view = new DataView(data.buffer);
        }
        return buffer;
    }

    public pushProperty(type : DataType, val : any,isary = false) {
        if (val == null) {
            this.writeType(DataType.Null);
            return;
        }

        if(type == DataType.Object){
            throw new Error('DataType.Object is not support currently.');
        }

        this.writeType(type);
        let f:(v:any)=>void =this[BinaryBuffer.WriteFuncMap[type]];
        if(!isary){
            f.call(this,val);
            return;
        }
        if(!Array.isArray(val)){
            throw new Error(`target property: ${val} is not an array.`)
        }
        let ary = <Array<any>>val;
        
        let arylen = ary.length;
        this.writeUint16(arylen);
        for(let i=0;i<arylen;i++){
            f.call(this,ary[i]);
        }
    }

    public readProperty(type : DataType,isary= false) : any {
        let t = this.readType();
        if (t == DataType.Null) 
            return null;
        if (t != type) 
            throw new Error(`data type mismatch ${type} ${t}`);
        
        let f:(v:any)=>void = this[BinaryBuffer.ReadFuncMap[type]];

        if(!isary){
            return f.call(this);
        }

        let arylen = this.readUint16();
        if(arylen == 0) return [];

        let ary:any[] = [];
        for(let i=0;i<arylen;i++){
            ary.push(f.call(this));
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
    public readUInt32() : number {
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
        return this.readUint8();
    }
}
BinaryBuffer.initialize();


class BinarySeralizer {
    public static serialize <T> (mc : TypeMetaClass, obj : T):DataView{
        let properties = mc.properties;

        let binarybuffer = BinaryBuffer.create();
        for(let i=0,len = properties.length;i<len;i++){
            let p = properties[i];
            binarybuffer.pushProperty(p.datatype,obj[p.key],p.isArray);
        }
        return new DataView(binarybuffer.m_arrayBuffer.buffer,0,binarybuffer.pos);
    }

    public static deserialize<T>(tar:T,mc:TypeMetaClass,buffer:ArrayBuffer):T | null{
        let properties = mc.properties;
        let binarybuffer = BinaryBuffer.create(new Uint8Array(buffer));

        for(let i=0,len= properties.length;i<len;i++){
            let p = properties[i];
            var val = binarybuffer.readProperty(p.datatype,p.isArray);
            tar[p.key] = val;
        }
        return tar;
    }
}



export function seralizeField(type : DataType,array:boolean = false) {
    return function (target : any, key : string) {
        TypeReflector.register(target, key, type,array);
    }
}

export function BinarySerialize < T > (obj : T):DataView{
    let p = Object.getPrototypeOf(obj);
    let mc = TypeReflector.getMetaClass(p);
    if (mc == null) 
        throw new Error(`reflect class ${p} invalid`);
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