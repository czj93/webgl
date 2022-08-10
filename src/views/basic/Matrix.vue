<template>
  <div>
    <div>
        <canvas style="border: 1px solid #222" />
    </div>

    <div>
        旋转：<span>{{ angleValue }}</span>
        <input type="range" min="0" max="360" v-model="angleValue">
    </div>
    <div>
        平移x:{{ mx }}
        <input type="range" min="0" max="350" v-model="mx" />
    </div>
    <div>
        平移y:{{ my }}
        <input type="range" min="0" max="350" v-model="my" />
    </div>
    <div>
        缩放x:{{ sx }}
        <input type="range" min="0" max="2" step="0.01" v-model="sx" />
    </div>
    <div>
        缩放y:{{ sy }}
        <input type="range" min="0" max="2" step="0.01" v-model="sy" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import webglUtils from '../../utils/webglUtils'

onMounted(main)

const angleValue = ref(0)
const mx = ref(100)
const my = ref(100)
const sx = ref(1)
const sy = ref(1)

const m3 = {
    identity: function() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]
    },

    projection: function(width: number, height: number) {
        // 注意：这个矩阵翻转了 Y 轴，所以 0 在上方
        return [
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ];
    },

    translation: function(tx: number, ty: number) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1
        ]
    },

    rotation: function(angle: number) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return [
            c, -s, 0,
            s,  c, 0,
            0,  0, 1
        ]
    },

    scaling: function(sx: number, sy: number) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0,  0, 1
        ]
    },

    translate: function(m: Array<number>, tx: number, ty: number) {
        return m3.multiply(m, this.translation(tx, ty));
    },

    rotate: function(m: Array<number>, angle: number) {
        const angleDegress = (360 - angle) * Math.PI / 180;
        return  m3.multiply(m, this.rotation(angleDegress))
    },

    
    scale: function(m: Array<number>, sx: number, sy: number) {
        return m3.multiply(m, this.scaling(sx, sy));
    },

    multiply: function(a: Array<number>, b: Array<number>) {
        const len = 3
        var a00 = a[0 * len + 0];
        var a01 = a[0 * len + 1];
        var a02 = a[0 * len + 2];
        var a10 = a[1 * len + 0];
        var a11 = a[1 * len + 1];
        var a12 = a[1 * len + 2];
        var a20 = a[2 * len + 0];
        var a21 = a[2 * len + 1];
        var a22 = a[2 * len + 2];
        var b00 = b[0 * len + 0];
        var b01 = b[0 * len + 1];
        var b02 = b[0 * len + 2];
        var b10 = b[1 * len + 0];
        var b11 = b[1 * len + 1];
        var b12 = b[1 * len + 2];
        var b20 = b[2 * len + 0];
        var b21 = b[2 * len + 1];
        var b22 = b[2 * len + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
  },
}

function main() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return

        const vertexShaderSource = `
            // 一个属性值，将会从缓冲中获取数据
            attribute vec2 a_position;
            uniform mat3 u_matrix;
            
            // 所有着色器都有一个main方法
            void main() {          
                gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
            }
        `

        const fragementShaderSource = `
            // 片断着色器没有默认精度，所以我们需要设置一个精度
            // mediump是一个不错的默认值，代表“medium precision”（中等精度）
            precision mediump float;
            
            void main() {
                // gl_FragColor是一个片断着色器主要设置的变量
                gl_FragColor = vec4(0.1098, 0.38039, 0.5, 0.92156); // 返回“ 蓝色 ”
            }
        `

        // 创建 着色器程序
        const program = webglUtils.createProgramFromShaderSource(gl, vertexShaderSource, fragementShaderSource)
        if (!program) return
        // 从着色器程序中找到变量 a_position 的位置
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
        const matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix')
        
        // 创建一个缓冲
        const positionBuffer = gl.createBuffer()
        // 绑定缓冲的数据源
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        // 创建顶点数据
        const positions = [
            0, 0,
            60, 0,
            0, 100,
        ]
        // 向缓冲中存放数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

        draw(gl, program)
        
        const animation = () => {
            draw(gl, program)
            requestAnimationFrame(animation)
        }

        requestAnimationFrame(animation)

        function draw(gl: WebGLRenderingContext, program: WebGLProgram){
            webglUtils.resize(gl)

            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

            gl.clearColor(0, 0, 0, 0)

            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.useProgram(program)

            // 可以从的缓冲中获取数据给着色器中的属性
            gl.enableVertexAttribArray(positionAttributeLocation)

            var size = 2;          // 每次迭代使用两个单位数据
            var type = gl.FLOAT;   // 使用浮点数
            var normalize = false; // 是否对数据做归一化
            var stride = 0;        // 0 = 移动距离 * 单位距离长度sizeof(type)  每次迭代跳多少距离到下一个数据
            var offset = 0;        // 从绑定缓冲的起始处开始
            gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

            let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight)
            // 平移
            matrix = m3.translate(matrix, mx.value, my.value)
            // 旋转
            matrix = m3.rotate(matrix, angleValue.value)
            // 缩放
            matrix = m3.scale(matrix, sx.value, sy.value)
            // 矩阵变化操作的顺序的变化是否会影响最终的结果?
            // 平移变化是怎么改变旋转的圆心的?
            // 改变旋转圆心
            // matrix = m3.translate(matrix, -30, -50)

            gl.uniformMatrix3fv(matrixUniformLocation, false, matrix)

            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 3;
            gl.drawArrays(primitiveType, offset, count);
        }
    }
}
</script>