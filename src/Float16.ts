export class Float16{
    public static ByteToFloat16(uint16:number){
        let d = uint16;
        let negative = ((d>>15) & 1) !=0;
        let mask = 0b11111;
        let exponent = (d >>10) & mask;
        let significand = d & 0b1111111111;
        if(exponent == 0 && significand == 0){
            return negative ? -0:0;
        }
        if(exponent == mask){
            if(significand == 0){
                return negative? -Infinity: Infinity;
            }
            else{
                return NaN;
            }
        }
        let f= 0;
        if(exponent == 0){
            f = significand /512.0;
        }
        else{
            f= (1.0 + significand / 1024.0);
        }
        return (negative? -1.0 :1.0) * Math.pow(2,exponent-15) * f; 
    }
    public static Float16ToByte(float16:number):number{
        let f = float16;
        if(isNaN(f)) return 0b0111110000000001;
        if(1/f === -Infinity) return 0b1000000000000000;
        if(f === 0) return 0;
        if(f === -Infinity) return 0b1111110000000000;
        if(f === Infinity) return  0b0111110000000000;
        let negative = f < 0;
        f= Math.abs(f);
        let fe = Math.floor(f);
        let e= 0;
        let si = 0;
        if(fe >0){
            while(fe >0){
                e++;
                fe = fe >> 1;
            }
            e+=14;
            let em = Math.pow(2,e-15);
            let s = f/ em -1.0;
            si = Math.round(s *1024);
        }
        else{
            let fi = f * (1<<15);
            fe = Math.floor(fi);
            if(fe >0){
                while (fe > 0) {
                    e++;
                    fe = fe >> 1;
                }
                e--;
            }
            if(e == 0){
                si = Math.round(fi *512);
            }
            else{
                let em = 1<<e;
                let s= fi/em -1.0;
                si = Math.round(s *1024);
            }
        }
        return ((e<<10) + si) + (negative? 1<<15: 0);
    }
}