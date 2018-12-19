import { DataType } from "../src/DataType";
import { SerializeField } from "../src/SerializeField";
import { verfiy } from "./helper.test";
import { BinarySerializer } from "../src/BinarySerializer";


describe("map",()=>{

    it("map-basis",()=>{
        class TestObj{
            @SerializeField(DataType.String,false)
            public type:string;
            @SerializeField(DataType.Int32,false)
            public value:number;

            public constructor(t:string,v:number){
                this.type = t;
                this.value = v;
            }
        }
        class TestClass{
            @SerializeField(DataType.Map,false,TestObj)
            public map:{[key:string]:string};
        }
        var map = {};
        map['java'] = new TestObj("java",10);
        map['cahrp'] = {type:"csharp",value:11};
        var obj1 = new TestClass();
        obj1.map = map;
   
        let d = BinarySerializer.Serialize(obj1,TestClass);
        let obj2 = BinarySerializer.Deserialize(d,TestClass);
        verfiy(obj2,obj1);
    });

    it("map-primitive-type",()=>{
        class TestClass{
            @SerializeField(DataType.Map,false,DataType.Float32)
            public map:{[key:string]:number};
        }
        var map = {};
        map['111'] = 111;
        map['132.4'] =132.4;
        map['-12553'] = -12553;
        var obj1 = new TestClass();
        obj1.map = map;
   
        let d = BinarySerializer.Serialize(obj1,TestClass);
        let obj2 = BinarySerializer.Deserialize(d,TestClass);
        verfiy(obj1,obj2);
    })
})
