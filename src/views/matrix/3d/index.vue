<template>
    <div>
        <div>
            <canvas style="border: 1px solid #222" />
        </div>
        
        <div class="contral-wrap">
            <div>
                <span>平移x: {{ tx }}</span>
                <input type="range" min="0" max="350" v-model="tx" />
            </div>
            <div>
                <span>平移y: {{ ty }}</span>
                <input type="range" min="0" max="350" v-model="ty" />
            </div>
            <div>
                <span>平移z: {{ tz }}</span>
                <input type="range" min="0" max="350" v-model="tz" />
            </div>
            <div>
                <span>旋转x: {{ rx }}</span>
                <input type="range" min="0" max="360" step="0.1" v-model="rx">
            </div>
            <div>
                <span>旋转y: {{ ry }}</span>
                <input type="range" min="0" max="360" step="0.1" v-model="ry">
            </div>
            <div>
                <span>旋转z: {{ rz }}</span>
                <input type="range" min="0" max="360" step="0.1" v-model="rz">
            </div>
            <div>
                <span>缩放x: {{ sx }}</span>
                <input type="range" min="0" max="2" step="0.01" v-model="sx" />
            </div>
            <div>
                <span>缩放y: {{ sy }}</span>
                <input type="range" min="0" max="2" step="0.01" v-model="sy" />
            </div>
            <div>
                <span>缩放z: {{ sz }}</span>
                <input type="range" min="0" max="2" step="0.01" v-model="sz" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import m4 from './m4'
import { fGeometryData, sideColorData } from './data'
import webglUtils from '../../../utils/webglUtils'

const tx = ref(100)
const ty = ref(100)
const tz = ref(0)

const sx = ref(1)
const sy = ref(1)
const sz = ref(1)

const rx = ref(0)
const ry = ref(0)
const rz = ref(0)

// 顶点着色器
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;

    void main() {
        gl_Position = u_matrix * a_position;
        v_color = a_color;
    }
`

// 片段着色器
const fragementShaderSource = `
    // 设置精度
    precision mediump float;

    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }
`

function main() {
    const canvas = document.querySelector('canvas')
    const gl = canvas?.getContext('webgl')
    if (!gl) return

    const program = webglUtils.createProgramFromShaderSource(gl, vertexShaderSource, fragementShaderSource);

    if (!program) return

    // 获取顶点着色器的在着色器程序中的位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color')
    const matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix')

    
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    setGeometry(gl)

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    setColor(gl)
    // draw(gl, program)

    const animat = () => {
        draw(gl, program)
        requestAnimationFrame(animat)
    }

    animat()

    function draw(gl: WebGLRenderingContext, program: WebGLProgram) {
        //
        webglUtils.resize(gl)

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)

        // 只绘制正面
        gl.enable(gl.CULL_FACE)

        // 开启深度绘制 z的值也用于存储像素的深度信息
        gl.enable(gl.DEPTH_TEST)

        gl.useProgram(program)

        gl.enableVertexAttribArray(positionAttributeLocation)
        // 在这个demo 中，必须要 调用两次 bindBuffer ,才会正确显示图形
        // 之前的2d的demo，调用一次就能正确显示，这个是为什么，为什么会有差异？
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
        
        gl.enableVertexAttribArray(colorAttributeLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorAttributeLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0)

        // const matrix = [
        //     2 / gl.canvas.clientWidth, 0, 0, 0,
        //     0, -2 / gl.canvas.clientHeight, 0, 0,
        //     0, 0, 2 / 400, 0,
        //     -1, 1, 0, 1,
        // ]
        // console.log(matrix)

        let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
            matrix = m4.translate(matrix, tx.value, ty.value, tz.value);
            matrix = m4.xRotate(matrix, rx.value);
            matrix = m4.yRotate(matrix, ry.value);
            matrix = m4.zRotate(matrix, rz.value);
            matrix = m4.scale(matrix, sz.value, sy.value, sz.value);

        // const matrix = [0.0026095039595996614, 0.0012356654739713428, -0.0031694184489966864, 0, 0.0018271943434997708, -0.00446336797695295, 0.0017042432096518146, 0, 0.0014854771941676605, 0.0033194496642141615, 0.0034713602200744193, 0, -0.8418277680140598, 0.14529914529914523, 0, 1]

        gl.uniformMatrix4fv(matrixUniformLocation, false, matrix)

        // 设置变量

        gl.drawArrays(gl.TRIANGLES, 0, 16*6)
    }
}

function setGeometry(gl: WebGLRenderingContext) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fGeometryData), gl.STATIC_DRAW)
}

function setColor(gl: WebGLRenderingContext) {
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(sideColorData), gl.STATIC_DRAW)
}

onMounted(main)


</script>
<style scoped>
.contral-wrap span {
    display: inline-block;
    width: 100px;
}
</style>