import {TestClass} from "./TestClass";
import {BinarySerialize, BinaryDeserialize} from "./BinarySeralize";
import {TextEncoder} from 'text-encoding';

let t = new TestClass();

t.index = 14;
t.title = "dwdwdw";
t.floatAry = [1.2, 433.3, -3243.1];
t.int16 = [13, 5454, -124, 32212];
t.strlist = ['hello', 'world', 'typescript', '!'];

let data = BinarySerialize(t);

let off = data.byteOffset;
let len = data.byteLength + off;

let braw = data
    .buffer
    .slice(off, len);

console.log('binary length: ' + data.byteLength);
let jstr = JSON.stringify(t, null, 0);
let enc = new TextEncoder();
console.log('json length: ' + enc.encode(jstr).length);

let t1 = BinaryDeserialize < TestClass > (TestClass, braw);

console.log('--------------------');

console.log(t, Object.getPrototypeOf(t));
console.log(t1, Object.getPrototypeOf(t1));
