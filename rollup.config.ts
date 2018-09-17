import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify-es';

let config = {
    input: './src/BinarySerializer.ts',
    output: [
        {file: 'dist/BinarySerializer.umd.js', name: 'ts-binary-serializer', format: 'umd',sourcemap:true},
        {file: 'dist/BinarySerializer.es.js',format: 'es'}
    ],
    plugins: [
        typescript({
            tsconfigOverride:{
                compilerOptions:{module:'es2015',declaration:true},
                exclude: [
                    "./src/BinarySerializer.test.ts"
                  ]
            },
            useTsconfigDeclarationDir:true
        }),
        resolve({
            jsnext:true,
            extensions: ['.ts','.js']
        }),
        uglify(),
        commonjs(),

    ]
}

export default config;