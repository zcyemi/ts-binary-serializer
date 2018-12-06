import { SerializeField, BinarySerialize, BinaryDeserialize } from "../src/BinarySerializer";
import { DataType } from "../src/DataType";
import { TypeReflector } from "../src/TypeReflector";


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
        var testclass = new TestClass();
        testclass.map = map;
   
        let d = BinarySerialize(testclass,TestClass);
        let testclassd = BinaryDeserialize(TestClass,d);

    })
})
