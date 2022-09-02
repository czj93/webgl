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
                <span>缩放: {{ ss }}</span>
                <input type="range" min="0" max="1000" step="1" v-model="ss" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import m4 from '../matrix/3d/m4'
import webglUtils from '../../utils/webglUtils'
import { sphere } from '../../utils/shape'

onMounted(main)

const tx = ref(175)
const ty = ref(175)
const tz = ref(0)

const ss = ref(150)

const rx = ref(30)
const ry = ref(286)
const rz = ref(0)
  
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    varying vec2 v_texcoord;
    uniform mat4 u_matrix;

    void main() {
        gl_Position = u_matrix * a_position;
        v_texcoord = a_texcoord;
    }
`
  
// 片段着色器
const fragementShaderSource = `
    // 设置精度
    precision mediump float;
    uniform sampler2D u_image;

    varying vec2 v_texcoord;

    void main() {
        // gl_FragColor = vec4(1, 0, 0, 1);
        gl_FragColor = texture2D(u_image, v_texcoord);
    }
`

function main() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return

        webglUtils.loadImages(['/earth_texture.jpg'], (images) => {
            render(gl, images)
        })

        function render(gl: WebGLRenderingContext, images: Array<HTMLImageElement>) {
            const uNumber = 60
            const vNumber = 60
            
            const EarthInfo = sphere(uNumber, vNumber)

            const attributes = {
                texcoord: EarthInfo.uvs,
                position: EarthInfo.positions,
            }

            const uniforms = {
                u_matrix: m4.identity()
            }

            const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
        
            const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes)
            if (!programInfo) return

            requestAnimationFrame(drawSence)

            function drawSence() {
                if (!gl) return
                webglUtils.resize(gl)
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.enable(gl.CULL_FACE)
                gl.enable(gl.DEPTH_TEST)

                if (programInfo?.program) {
                    gl.useProgram(programInfo.program)

                    webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo)

                    uniforms.u_matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 1000);
                    uniforms.u_matrix = m4.translate(uniforms.u_matrix, tx.value, ty.value, tz.value);
                    uniforms.u_matrix = m4.xRotate(uniforms.u_matrix, rx.value);
                    uniforms.u_matrix = m4.yRotate(uniforms.u_matrix, ry.value);
                    uniforms.u_matrix = m4.zRotate(uniforms.u_matrix, rz.value);
                    uniforms.u_matrix = m4.scale(uniforms.u_matrix, ss.value, ss.value, ss.value);


                    webglUtils.setUniforms(programInfo, uniforms)
                    // pixelStorei 图像预处理的函数
                    // 图片上下对称翻转坐标轴
                    // 解决坐标系 Y 轴翻转导致的纹理渲染异常（Y轴翻转）
                    // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

                    var texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    
                    // 给纹理绑定图片
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);

                    gl.drawArrays(gl.TRIANGLES, 0, 6 * uNumber * vNumber)

                    requestAnimationFrame(drawSence)
                }
            }
        }
    }
}
  
</script>
<style scoped>
canvas {
    border: 1px solid #222;
}
</style>