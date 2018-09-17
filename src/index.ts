import {TestClass, Vec2} from "./TestClass";
import {BinarySerialize, BinaryDeserialize, TypeReflector} from "./BinarySeralize";
import {TextEncoder} from 'text-encoding';

let t = new TestClass();

t.index = 14;
t.title = "dwdwdw";
t.floatAry = [1.2, 433.3, -3243.1];
t.int16 = [13, 5454, -124, 32212];
t.strlist = ['hello', 'world', 'typescript', '!'];
t.vector = new Vec2(-20.4,17.6);
t.vary = [new Vec2(1,9),new Vec2(0,0),new Vec2(1,3),new Vec2(2,54)];


let mt1 = TypeReflector.getMetaClass(Object.getPrototypeOf(t));
let mt2 = TypeReflector.getMetaClass(Object.getPrototypeOf(new Vec2(1,1)));


let data = BinarySerialize(t);

let off = data.byteOffset;
let len = data.byteLength + off;

console.log(data.byteLength);

let e = new TextEncoder();
console.log(e.encode(JSON.stringify(t)).length);


let braw = data.buffer.slice(off, len);


let t1 = BinaryDeserialize <TestClass>(TestClass, braw);

// console.log('--------------------');

console.log(t, Object.getPrototypeOf(t));
console.log(t1, Object.getPrototypeOf(t1));

