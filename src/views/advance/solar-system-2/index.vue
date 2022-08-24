<template>
  <div>
    <canvas />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import m4 from '../../../utils/m4'
import webglUtils from '../../../utils/webglUtils'
import { createSolarSystem } from './SolarSystem'

onMounted(main)

// 优化：
// 优化太阳系结构， 从 太阳 - 地球 - 月球
// 改为
//       太阳系
//        |- 太阳
//        |- 地月系统
//        |    |- 地球
//        |    |- 月球系统
//        |    |    |- 月球
// 这样能避免 太阳 地球的自传 影响下级

const vertexShaderSource = `
    attribute vec4 a_position;
    uniform mat4 u_matrix;

    void main() {
        gl_Position = u_matrix * a_position;
    }
`

// 片段着色器
const fragementShaderSource = `
    // 设置精度
    precision mediump float;

    uniform vec3 u_color;

    void main() {
        gl_FragColor = vec4(u_color, 1);
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

            var cameraPosition = [0, -175, 0];
            var target = [0, 0, 0];
            var up = [0, 0, 1];

            var cameraMatrix = m4.lookAt(cameraPosition, target, up);

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