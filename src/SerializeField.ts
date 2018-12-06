import { DataType } from "./DataType";
import { TypeReflector } from "./TypeReflector";


/**
 * 
 * @param type BasicDataType
 * @param array flag for labeling the property is arrayObject
 * @param ptype when type is set to DataType.Object ptype must be the constructor; DataType.Map ptype can be 
 */
export function SerializeField(type : DataType,array:boolean = false,ptype?:any | DataType) {
    return function (target : any, key : string) {
        TypeReflector.register(target, key, type,array,ptype);
    }
}
