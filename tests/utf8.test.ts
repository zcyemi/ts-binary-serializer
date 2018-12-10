import { SerializeField } from "../src/SerializeField";
import { DataType } from "../src/DataType";
import { BinarySerialize, BinaryDeserialize } from "../src/BinarySerializer";
import * as chai from 'chai';


class UTF8STR{
    @SerializeField(DataType.String)
    public str:string;
}

describe("utf8",()=>{
    it("case1",()=>{
        const str= `F󘓢ㆢx󙜒󷿚 ZE{Tݲꥀ฽㒚쐅ܘ𿀯Ěp Ѕn绺񮡋.叮�ŀ춅ڇꀒͫ툵𳞟֘߇豿򭚒<Ჱ࿬𼡟8ٳy􏕙ģʿԲǡ󃍒ᕡiЖ򰾆󃡫n􊵇ć椲1鼰糷꜒񵦦¹I񌸿Fٔ͜찉ĕ򗔸育эϏݓ򑮚같ۏ񗨯燦ɥ覮˲ZⓀ􄞿ܷMTÎq̘`;
        var test = new UTF8STR();
        test.str = str;
        var byteary = BinarySerialize(test);
        var testd = BinaryDeserialize<UTF8STR>(UTF8STR,byteary);
        chai.expect(testd.str === str).to.eq(true);
    })
    
})