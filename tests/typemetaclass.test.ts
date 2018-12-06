import { DataType } from '../src/DataType';
import { SerializeField } from '../src/SerializeField';

class ClassB{
    @SerializeField(DataType.String)
    public str:string;
}
class ClassD{
    @SerializeField(DataType.String)
    public str:string;
}
class ClassC{
    @SerializeField(DataType.Float32)
    public num:number;
    @SerializeField(DataType.Object,false,ClassD)
    public d:ClassD;
}
class ClassA{
    @SerializeField(DataType.Object,false,ClassB)
    public b:ClassB;
    @SerializeField(DataType.String)
    public str:string;
    @SerializeField(DataType.Object,false,ClassC)
    public c:ClassC;
    @SerializeField(DataType.Float32)
    public num:number;
}
