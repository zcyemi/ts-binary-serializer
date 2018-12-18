import { EncodeVariant32Unsigned, DecodeVariant32Unsigned, EncodeVariant32Signed, DecodeVariant32Signed } from "../src/VariantEncoding";
import { verfiy } from "./helper.test";

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
    })
})
