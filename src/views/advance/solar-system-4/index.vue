<template>
  <div>
    <div>
        <canvas />
    </div>

    <div class="contral-wrap">
        <!-- <div>
            <span>平移x: {{ tx }}</span>
            <input type="range" min="-350" max="350" v-model="tx" />
        </div>
        <div>
            <span>平移y: {{ ty }}</span>
            <input type="range" min="0" max="360" v-model="ty" />
        </div> -->
        <div>
            <span>相机深度: {{ tz }}</span>
            <input type="range" min="0" max="2000" v-model="tz" />
        </div>
        <div>
            <span>X轴旋转: {{ rx }}</span>
            <input type="range" min="0" max="360" step="0.1" v-model="rx" />
        </div>
        <div>
            <span>Y轴旋转: {{ ry }}</span>
            <input type="range" min="0" max="360" step="0.1" v-model="ry" />
        </div>
        <div>
            <span>Z轴旋转: {{ rz }}</span>
            <input type="range" min="0" max="360" step="0.1" v-model="rz" />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import m4 from '../../../utils/m4'
import webglUtils from '../../../utils/webglUtils'
import { createSolarSystem } from './SolarSystem'

onMounted(main)

// 优化：
// 添加摄像机，并可以自由控制摄像机视角
// 参考资料 https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-3d-camera.html

const tx = ref(0)
const ty = ref(-175)
const tz = ref(200)

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
    }
`

function degToRad(d: number) {
    return d * Math.PI / 180;
  }

function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function emod(x: number, n: number) {
    return x >= 0 ? (x % n) : ((n - (-x % n)) % n);
}

function computeCameraMatrix() {
    var cameraMatrix = m4.xRotation(degToRad(rx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, ry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, rz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, tz.value);
    return cameraMatrix
}

// 通过控制 lookAt 的参数来自由移动 摄像机
function computeCameraMatrixByLookAt() {
    // 摄像机观察目标
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var cameraMatrix = m4.xRotation(degToRad(rx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, ry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, rz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, tz.value);
    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14],
    ]
    
    cameraMatrix = m4.lookAt(cameraPosition, target, up);
    return cameraMatrix
}

const cameraAngleRadians = degToRad(0);
const fieldOfViewRadians = degToRad(60);
const cameraHeight = 50;

function main() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return
        const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)

        if (!programInfo) return
        const sunSystem = createSolarSystem(gl, programInfo)

        requestAnimationFrame(drawScene)

        function drawScene(time: number) {
            time *= 0.01;

            if (!gl) return
            webglUtils.resize(gl)
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.enable(gl.CULL_FACE)
            gl.enable(gl.DEPTH_TEST)

            var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

            const cameraMatrix = computeCameraMatrix()
            // const cameraMatrix = computeCameraMatrixByLookAt()

            var viewMatrix = m4.inverse(cameraMatrix);

            var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
            // 更新本地矩阵
            sunSystem.node.update()
            // 更新世界矩阵
            sunSystem.node.updateWorldMatrix()

            sunSystem.each(sunSystem.node, node => {
                if (node.drawInfo) {
                    node.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, node.worldMatrix);
                }
            })

            if (programInfo?.program) {
                gl.useProgram(programInfo.program)

                sunSystem.each(sunSystem.node, node => {
                    if (node.drawInfo) {
                        webglUtils.setBuffersAndAttributes(gl, programInfo, node.drawInfo.bufferInfo);
                        webglUtils.setUniforms(programInfo, node.drawInfo.uniforms);
                        gl.drawArrays(gl.TRIANGLES, 0, 6*6);
                    }
                })
            }
            requestAnimationFrame(drawScene)
        }
    }
}

</script>