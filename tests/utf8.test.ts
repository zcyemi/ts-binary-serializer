import { SerializeField } from "../src/SerializeField";
import { DataType } from "../src/DataType";
import {  BinarySerializer } from "../src/BinarySerializer";
import { verfiy } from "./helper.test";


class UTF8STR{
    @SerializeField(DataType.String)
    public str:string;
}

describe("utf8",()=>{

    it("case",()=>{
        const str= `F󘓢ㆢx󙜒󷿚 ZE{Tݲꥀ฽㒚쐅ܘ𿀯Ěp Ѕn绺񮡋.叮�ŀ춅ڇꀒͫ툵𳞟֘߇豿򭚒<Ჱ࿬𼡟8ٳy􏕙ģʿԲǡ󃍒ᕡiЖ򰾆󃡫n􊵇ć椲1鼰糷꜒񵦦¹I񌸿Fٔ͜찉ĕ򗔸育эϏݓ򑮚같ۏ񗨯燦ɥ覮˲ZⓀ􄞿ܷMTÎq̘`;
        var test = new UTF8STR();
        test.str = str;

        var df = BinarySerializer.Serialize(test,UTF8STR,{fastUTF8string:true});
        var d = BinarySerializer.Serialize(test,UTF8STR,{fastUTF8string:false});

        var sf = BinarySerializer.Deserialize(df,UTF8STR,{fastUTF8string:true});
        var s = BinarySerializer.Deserialize(d,UTF8STR,{fastUTF8string:false});
        
        verfiy(test,sf);
        verfiy(test,s);
        
    })
    
})
