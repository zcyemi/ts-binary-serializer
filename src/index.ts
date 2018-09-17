import { TestClass } from "./TestClass";
import { BinarySerialize, BinaryDeserialize } from "./BinarySeralize";


let t =new TestClass();

t.index= 14;
t.title= "dwdwdw";

let data= BinarySerialize(t);

let off = data.byteOffset;
let len =data.byteLength + off;

let braw = data.buffer.slice(off,len);
let b = new Uint8Array(braw);

let ary:number[] =[];
for(var i=0;i<b.byteLength;i++){
    ary.push(b[i]);
}

console.log(ary);

let t1 = BinaryDeserialize<TestClass>(TestClass,braw);

console.log(t,Object.getPrototypeOf(t));
console.log(t1,Object.getPrototypeOf(t1));
