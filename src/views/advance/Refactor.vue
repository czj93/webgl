<template>
  <div>
    <canvas />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import m4 from '../matrix/3d/m4'
import webglUtils from '../../utils/webglUtils'
import { fGeometryData, sideColorData } from '../matrix/3d/data'

onMounted(main)

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
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return


        const attributes = {
            color: {
                numComponents: 3,
                data: sideColorData
            },
            position: fGeometryData,
        }

        const uniforms = {
            u_matrix: m4.identity()
        }

        const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
    
        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes)
        if (!programInfo) return
        webglUtils.resize(gl)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE)
        gl.enable(gl.DEPTH_TEST)

        if (programInfo?.program) {
            gl.useProgram(programInfo.program)

            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo)

            uniforms.u_matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
            uniforms.u_matrix = m4.translate(uniforms.u_matrix, 100, 100, 0);
            uniforms.u_matrix = m4.xRotate(uniforms.u_matrix, 30);
            uniforms.u_matrix = m4.yRotate(uniforms.u_matrix, 60);

            webglUtils.setUniforms(programInfo, uniforms)

            gl.drawArrays(gl.TRIANGLES, 0, 16*6)
        }
    }
}

</script>
<style scoped>
canvas {
    border: 1px solid #222;
}
</style>