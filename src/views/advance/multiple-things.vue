<template>
  <div>
    <div>
        <canvas />
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
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import m4 from '../../utils/m4'
import webglUtils from '../../utils/webglUtils'
import { cube, triangle } from '../../utils/shape'

onMounted(main)

const tx = ref(100)
const ty = ref(100)
const tz = ref(0)

const sx = ref(1)
const sy = ref(1)
const sz = ref(1)

const rx = ref(0)
const ry = ref(0)
const rz = ref(0)

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
        // gl_FragColor = vec4(0.1098, 0.38039, 0.5, 0.92156);
    }
`

function randColor(count: number, repeat = 1, defaultColors?: Array<Array<number>>) {
    const colors = []

    for(let i = 0; i < count; i++) {
        const r = defaultColors && defaultColors[i] ? defaultColors[i][0] : Math.floor(Math.random() * 255)
        const g = defaultColors && defaultColors[i] ? defaultColors[i][1] : Math.floor(Math.random() * 255)
        const b = defaultColors && defaultColors[i] ? defaultColors[i][2] : Math.floor(Math.random() * 255)

        for(let n = 0 ; n < repeat; n++) {
            colors.push(r, g, b)
        }
    }
    return colors
}

// 模型点的顺序会导致绘制失败， 可见的面三角形的是逆时针的， 不可见的面是 顺时针的
function main() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return

        const cubeColors = [
            // 底 黑
            [0, 0, 0],
            // 顶 白
            [255, 255, 255],
            // 背面 蓝
            [0, 0, 255],
            // 正面 紫
            [255, 0, 255],
            // 左侧 黄
            [255, 255, 0],
            // 右侧 红
            [255, 0, 0],
        ]

        const triangleColors = [
            // 黑
            [0, 0, 0],
            // 蓝
            [0, 0, 255],
            // 绿
            [0, 255, 0],
            // 红
            [255, 0, 0],
        ]
        const cubeAttribute = {
            color: {
                numComponents: 3,
                data: randColor(6, 6, cubeColors),
            },
            position: cube(20, 20, 20)
        }
        const triangleAttrbute = {
            color: {
                numComponents: 3,
                data: randColor(4, 3, triangleColors),
            },
            position: triangle(20, 20, 20)
        }

        const cubeUniforms = {
            u_matrix: m4.identity()
        }

        const triangleUniforms = {
            u_matrix: m4.identity()
        }

        const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
    
        const cubeBufferInfo = webglUtils.createBufferInfoFromArrays(gl, cubeAttribute)
        const triangleBufferInfo = webglUtils.createBufferInfoFromArrays(gl, triangleAttrbute)

        if (!programInfo) return

        requestAnimationFrame(drawScene)

        function drawScene(time: number) {
            time *= 0.01;

            const cubeXRotation   = time;
            const cubeYRotation   =  -time;
            const triangleXRotation =  time;
            const triangleYRotation =  -time;

            if (gl) {
                webglUtils.resize(gl)
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.enable(gl.CULL_FACE)
                gl.enable(gl.DEPTH_TEST)

                if (programInfo?.program) {
                    gl.useProgram(programInfo.program)

                    // 正方形
                    webglUtils.setBuffersAndAttributes(gl, programInfo, cubeBufferInfo)

                    cubeUniforms.u_matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
                    cubeUniforms.u_matrix = m4.translate(cubeUniforms.u_matrix, 100, 100, 0);
                    cubeUniforms.u_matrix = m4.xRotate(cubeUniforms.u_matrix, cubeXRotation);
                    cubeUniforms.u_matrix = m4.yRotate(cubeUniforms.u_matrix, cubeYRotation);
                    // cubeUniforms.u_matrix = m4.xRotate(cubeUniforms.u_matrix, rx.value);
                    // cubeUniforms.u_matrix = m4.yRotate(cubeUniforms.u_matrix, ry.value);
                    cubeUniforms.u_matrix = m4.zRotate(cubeUniforms.u_matrix, rz.value);
                    cubeUniforms.u_matrix = m4.scale(cubeUniforms.u_matrix, sx.value, sy.value, sz.value);

                    webglUtils.setUniforms(programInfo, cubeUniforms)

                    gl.drawArrays(gl.TRIANGLES, 0, 6*6)


                    // // 三角形
                    webglUtils.setBuffersAndAttributes(gl, programInfo, triangleBufferInfo)

                    triangleUniforms.u_matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
                    triangleUniforms.u_matrix = m4.translate(triangleUniforms.u_matrix, 150, 100, 0);
                    
                    triangleUniforms.u_matrix = m4.xRotate(triangleUniforms.u_matrix, triangleXRotation);
                    triangleUniforms.u_matrix = m4.yRotate(triangleUniforms.u_matrix, triangleYRotation);
                    // triangleUniforms.u_matrix = m4.xRotate(triangleUniforms.u_matrix, rx.value);
                    // triangleUniforms.u_matrix = m4.yRotate(triangleUniforms.u_matrix, ry.value);
                    triangleUniforms.u_matrix = m4.yRotate(triangleUniforms.u_matrix, rz.value);
                    triangleUniforms.u_matrix = m4.scale(triangleUniforms.u_matrix, sx.value, sy.value, sz.value);

                    webglUtils.setUniforms(programInfo, triangleUniforms)

                    gl.drawArrays(gl.TRIANGLES, 0, 3*4)
                    requestAnimationFrame(drawScene)
                }
            }
        }

    }
}

</script>