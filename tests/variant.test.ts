import { EncodeVariant32Unsigned, DecodeVariant32Unsigned, EncodeVariant32Signed, DecodeVariant32Signed, Variant } from "../src/VariantEncoding";
import { verfiy, estimateTime } from "./helper.test";
import { SerializeField } from "../src/SerializeField";
import { DataType } from "../src/DataType";
import { BinarySerializer } from "../src/BinarySerializer";

describe("variant",()=>{
    
    it("unsigned32",()=>{

        var verifyVariant32 = (n)=>{
            var d = EncodeVariant32Unsigned(n);
            var m = DecodeVariant32Unsigned(d);
            verfiy(n,m);
        }
        verifyVariant32(0);
        verifyVariant32(1);
        verifyVariant32(10);
        verifyVariant32(100);
        verifyVariant32(1000);
        verifyVariant32(10000);
        verifyVariant32(100000);
        verifyVariant32(1000000);
        verifyVariant32(10000000);
        verifyVariant32(100000000);
        verifyVariant32(1000000000);
        verifyVariant32(1<<30);
    })

    it("signed32",()=>{
        var verifyVariant32 = (n)=>{
            var d = EncodeVariant32Signed(n);
            var m = DecodeVariant32Signed(d);
            verfiy(n,m);
        }
        verifyVariant32(0);
        verifyVariant32(1);
        verifyVariant32(10);
        verifyVariant32(100);
        verifyVariant32(1000);
        verifyVariant32(10000);
        verifyVariant32(100000);
        verifyVariant32(1000000);
        verifyVariant32(10000000);
        verifyVariant32(100000000);
        verifyVariant32(1000000000);
        verifyVariant32(1<<29);

        verifyVariant32(-1);
        verifyVariant32(-10);
        verifyVariant32(-100);
        verifyVariant32(-1000);
        verifyVariant32(-10000);
        verifyVariant32(-100000);
        verifyVariant32(-1000000);
        verifyVariant32(-10000000);
        verifyVariant32(-100000000);
        verifyVariant32(-1000000000);
        verifyVariant32(-(1<<30));

    });


    it("case",()=>{
        let cv = new ClassVariant();
        cv.uvint = 43132334;
        cv.vint = -1233344;
        cv.uvintary = [0,121,43355544,Variant.MAX_UINT];
        cv.vintary = [0,-1,-5423243,542223,Variant.MAX_INT,Variant.MIN_INT];

        let sd = BinarySerializer.Serialize(cv);
        let cv1 = BinarySerializer.Deserialize(sd,ClassVariant);

        verfiy(cv,cv1);
    })

    it("performance",()=>{

        var ary:number[] = [];
        for(var i=0;i<5000;i++){
            ary.push(Math.round((Math.random()-0.5)* Variant.MAX_INT));
        }
        var nonvar = new ClassVariantBenchmarkInt();
        nonvar.vint = ary;

        var variant = new ClassVariantBenchmarkVariant();
        variant.vint = ary;

        let [sd_non_t,sd_non] = estimateTime(()=>{return BinarySerializer.Serialize(nonvar);},10);
        let [sd_var_t,sd_var] = estimateTime(()=>{return BinarySerializer.Serialize(variant);},10);

        console.log(sd_non_t,sd_var_t);
        console.log(sd_non,sd_var);

    })
})

class ClassVariantBenchmarkVariant{
    @SerializeField(DataType.Varint32,true)
    public vint:number[];
}

class ClassVariantBenchmarkInt{
    @SerializeField(DataType.Int32,true)
    public vint:number[];
}

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
