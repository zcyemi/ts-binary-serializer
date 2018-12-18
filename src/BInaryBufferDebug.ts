import { BinaryBuffer } from "./BinaryBuffer";
import { Extends } from "./Utility";
import { TypeMetaProperty, TypeMetaClass } from "./TypeMetaClass";
import { DataType } from "./DataType";


export class BinaryBufDbgInfo{
    public msgs:BinaryBufDbgMsg[] = [];
    private m_lastmsg:BinaryBufDbgMsg;
    private m_ids:number = 0;

    public constructor(){
    }

    public emitDebugInfo(key:string,iswrite:boolean,extra?:string){
        let lastmsg = this.m_lastmsg;
        if(lastmsg != null && lastmsg.extra === extra && lastmsg.iswrite == iswrite && lastmsg.key === key){
            lastmsg.count ++;
        }
        else{
            let msg = new BinaryBufDbgMsg(this.m_ids,key,iswrite,1,extra);
            this.m_lastmsg = msg;
            this.msgs.push(msg);
        }
        this.m_ids ++;
    }
    
    public verifyException(derDbgInfo:BinaryBufDbgInfo){
        let sermsgs = this.msgs;
        let dermsgs = derDbgInfo.msgs;

        if(sermsgs.length == dermsgs.length) return;
        
        let errctx = sermsgs.slice(Math.max(0,dermsgs.length-10),Math.min(dermsgs.length + 5,sermsgs.length));
        console.error("--- verify start ---");
        console.error(">>> [serialize]");
        console.error(BinaryBufDbgInfo.fmtMsgs(errctx));
        console.error(">>> [derserialize]");
        console.log(BinaryBufDbgInfo.fmtMsgs(dermsgs.slice(Math.max(0,dermsgs.length-10))));
        console.error("--- verify end ---");
    }

    public static fmtMsgs(msgs:BinaryBufDbgMsg[]){
        let lines:string[] = [];
        msgs.forEach((msg)=>{
            let extra = msg.extra;
            if(extra != null){
                lines.push(`\t[${msg.id}] count:${msg.count} ${msg.key} extra:${extra}`);
            }
            else{
                lines.push(`\t[${msg.id}] count:${msg.count} ${msg.key}`);
            }
        })

        return lines.join('\n');
    }
}

export class BinaryBufDbgMsg{
    public key:string;
    public iswrite:boolean;
    public count:number = 0;
    public id:number = 0;
    public extra?:string;

    public constructor(id:number,key:string,iswrite:boolean,count:number,extra?:string){
        this.key = key;
        this.iswrite = iswrite;
        this.count = count;
        if(extra != null){
            this.extra = extra;
        }
        this.id = id;
    }
}

export class BinaryBufferDebug{

    private m_dbginfo:BinaryBufDbgInfo = new BinaryBufDbgInfo();
    public get dbginfo(): BinaryBufDbgInfo{ return this.m_dbginfo;}


    private static GenPropertyExtra(p:TypeMetaProperty):string{
        if(p.datatype == DataType.Object){
            let meta = <TypeMetaClass>p.pclass;
            let plist:string[] = [];
            meta.properties.forEach((p)=>{
                plist.push(p.key);
            });
            return `${p.key} <${meta.properties.length}>[${plist.join(',')}]`

        }
        else{
            return `${p.key}`

        }
    }
    /**
     * Inject debug info for fast finding the inconsistance between Serialize/Deserialize.
     * Aiming for zero performance decline with debug mode disabled.
     * @param buffer 
     */
    public static Gen(buffer:BinaryBuffer):BinaryBuffer & BinaryBufferDebug{
        let dbuffer:BinaryBufferDebug & BinaryBuffer = Extends(buffer,BinaryBufferDebug);
        var dbginfo = dbuffer.m_dbginfo;

        for (const key in buffer) {
            ((key)=>{
                let p = buffer[key];
                if(typeof p !== 'function') return;
                if(key.startsWith('write')){
                    if(key === 'writeProperty'){
                        buffer[key] = (...args)=>{
                            dbginfo.emitDebugInfo(key,true,BinaryBufferDebug.GenPropertyExtra(args[1]));
                            Reflect.apply(p,buffer,args);
                        }
                    }
                    else{
                        buffer[key] = (...args)=>{
                            dbginfo.emitDebugInfo(key,true);
                            Reflect.apply(p,buffer,args);
                        }
                    }
                    return;
                };
                if(key.startsWith('read')){
                    if(key === 'readProperty'){
                        buffer[key] = (...args)=>{
                            dbginfo.emitDebugInfo(key,false,BinaryBufferDebug.GenPropertyExtra(args[0]));
                            Reflect.apply(p,buffer,args);
                        }
                    }
                    else{
                        buffer[key] = (...args)=>{
                            dbginfo.emitDebugInfo(key,false);
                            return Reflect.apply(p,buffer,args);
                        }
                    }

                    return;
                };
            })(key);
        };
        return dbuffer;
    }
}


