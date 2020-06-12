# ts-binary-serializer 

Binary serializer for typescript, support NodeJs/Browser.

![npm](https://img.shields.io/npm/v/ts-binary-serializer)

## Quick Start

Install

```bash
//For npm
npm install ts-binary-serializer --save

//For yarn
yarn add ts-binary-serializer
```

enable decorators on tsconfig.json
```tsconfig
"experimentalDecorators": true
```

```ts
import { SerializeField, DataType, BinarySerializer } from 'ts-binary-serializer';

class A{
    @SerializeField(DataType.String)
    public str:string = "HelloWorld";
}
let binaryData = BinarySerializer.Serialize(new A(),A);

console.log(binaryData); //Uint8Array [ 9, 22, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100 ]

let a1 = BinarySerializer.Deserialize(binaryData,A);
console.log(a1); A { str: 'Hello world' }

```

## Usage
```ts
//Serialize
export function Serialize<T>(obj:T,type?:{new():T},options?:BinarySerializeOptions):Uint8Array

//Deserialize
export function Deserialize<T>(databuffer:Uint8Array|ArrayBuffer,type:{new():T},options?:BinaryDeserializeOptions):T
```

sample
```ts
classA{
//...
}

let a1 = new ClassA();
let data = BinarySerializer.Serialize(a,ClassA);
let a2 = BinarySerializer.Deserialize(data,ClassA);
```

## Decorator

```ts
//Decorator @seralizeField
export function SerializeField(type : DataType,array:boolean = false,ptype?:any | DataType)

//All support DataType
//remark: all js [Number] type can be attached with strict typed [DataType],
//Use shorter [DataType] may have smaller binary serialization size.But result will be different if there has numeric overflow.
export enum DataType {
    Null = 0,
    Float32 = 1,
    Float64 = 2,
    Int32 =  3,
    Int16 = 4,
    Int8 = 5,
    Uint32 = 6,
    Uint16 = 7,
    Uint8 = 8,
    String = 9,
    Bool = 10,
    Object = 11,
    Float16 = 12,
    Map = 13,
    Varint32 = 14,
    UVarint32 = 15,
    TypedArray = 16,
}

```

### Object Array
set the second param of @seralizeField to true when the property is an Array object.
```ts
class ClassA{
    @SerializeField(DataType.String,true)
    public stringArray:string[];
    @SerializeField(DataType.Float32,true)
    public numAry:Array<Number>;
}
```
### TypedArray
```ts
class ClassWithTypedArray{
    @SerializeField(DataType.TypedArray,false,Uint8Array)
    public uint8:Uint8Array;
    @SerializeField(DataType.TypedArray,false,Int32Array)
    public int32:Int32Array;
    @SerializeField(DataType.TypedArray,false,Float64Array)
    public float64:Float64Array;
}
```

### Nested Class
```ts
class ClassB{
    @SerializeField(DataType.Bool)
    public valid:boolean;
}
class ClassC{
    @SerializeField(DataType.Object,false,ClassB)
    public b:ClassB;
}
// ...
let buffer = BinarySerializer.Serialize(new ClassC(),ClassC)
```
nested class array is also supported.
```ts
class ClassC{
    @SerializeField(DataType.Object,true,ClassB)
    public b:ClassB[];
}
```

### Variant Encoding

`Varint32`/`UVarint32`

```ts
class ClassVariant{
    @SerializeField(DataType.Varint32)
    public vint:number;
    @SerializeField(DataType.UVarint32)
    public uvint:number;
    @SerializeField(DataType.Varint32,true)
    public vintary:number[];
    @SerializeField(DataType.UVarint32,true)
    public uvintary:number[];
}
```


### Map Encoding

```ts
class TestClass{
    @SerializeField(DataType.Map,false,TestObj)
    public map:{[key:string]:string};
}
```


## Dev And Test

This lib is packed using rollup.

Dist files:

ESModule: `dist/BinarySerializer.es.js`

UMD: `dist/BinarySerializer.umd.js`


build distribution

```bash
yarn build
```

run unitest
```bash
yarn test
```

## Benchmark

simple benchmark

| type | Size(byte) | SerializeTime(ms) | DeserializeTime(ms) |
| --- | ---| --- | --- |
| Json | 641395 | 7.0295 | 8.5726 |
| Binary | 157420 | 19.1871 | 19.8457 |

## License

MIT
