<template>
    <div>
        <div>
            <canvas />
        </div>

        <div class="contral-wrap">
            <div>
                <span>平移x: {{ tx }}</span>
                <input type="range" min="-350" max="350" v-model="tx" />
            </div>
            <div>
                <span>平移y: {{ ty }}</span>
                <input type="range" min="-350" max="350" v-model="ty" />
            </div>
            <div>
                <span>平移z: {{ tz }}</span>
                <input type="range" min="-350" max="350" v-model="tz" />
            </div>
            <div>
                <span>旋转x: {{ rx }}</span>
                <input type="range" min="-360" max="360" step="0.1" v-model="rx">
            </div>
            <div>
                <span>旋转y: {{ ry }}</span>
                <input type="range" min="-360" max="360" step="0.1" v-model="ry">
            </div>
            <div>
                <span>旋转z: {{ rz }}</span>
                <input type="range" min="-360" max="360" step="0.1" v-model="rz">
            </div>
            <div>
                <span>缩放: {{ ss }}</span>
                <input type="range" min="0" max="1000" step="1" v-model="ss" />
            </div>

            <div>操作相机</div>
            <div>
                <span>相机深度: {{ ctz }}</span>
                <input type="range" min="0" max="2000" v-model="ctz" />
            </div>
            <div>
                <span>X轴旋转: {{ crx }}</span>
                <input type="range" min="-360" max="360" step="0.1" v-model="crx" />
            </div>
            <div>
                <span>Y轴旋转: {{ cry }}</span>
                <input type="range" min="-360" max="360" step="0.1" v-model="cry" />
            </div>
            <div>
                <span>Z轴旋转: {{ crz }}</span>
                <input type="range" min="-360" max="360" step="0.1" v-model="crz" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import m4 from '../../utils/m4';
import { sphere } from '../../utils/shape'
import webglUtils from '../../utils/webglUtils'

onMounted(main)

// ISSUE: 运行一段时间后会内存奔溃

const tx = ref(0)
const ty = ref(0)
const tz = ref(0)

const ss = ref(300)

const rx = ref(0)
const ry = ref(0)
const rz = ref(0)

const ctz = ref(800)

const crx = ref(0)
const cry = ref(0)
const crz = ref(180)

var fieldOfViewRadians = webglUtils.degToRad(60);
var fRotationRadians = 0;
  
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
    attribute vec3 a_normal;
    varying vec2 v_texcoord;
    varying vec3 v_normal;
    uniform mat4 u_matrix;
    uniform mat4 u_worldViewProjection;
    uniform mat4 u_worldInverseTransposeMatrix;

    void main() {
        gl_Position = u_worldViewProjection * a_position;
        v_texcoord = a_texcoord;
        v_normal = mat3(u_worldInverseTransposeMatrix) * a_normal;
    }
`
  
// 片段着色器
const fragementShaderSource = `
    // 设置精度
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec3 u_reverseLightDirection;

    varying vec2 v_texcoord;
    varying vec3 v_normal;

    void main() {
        // gl_FragColor = vec4(1, 0, 0, 1);
        vec3 normal = normalize(v_normal);
        float light = dot(normal, u_reverseLightDirection);
        gl_FragColor = texture2D(u_image, v_texcoord);
        gl_FragColor.rgb *= light;
    }
`

function computeCameraMatrix() {
    var cameraMatrix = m4.xRotation(webglUtils.degToRad(crx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, cry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, crz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, ctz.value);
    return cameraMatrix
}


function main() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return

        webglUtils.loadImages(['/earth_texture.jpg'], (images) => {
            render(gl, images)
        })

        function render(gl: WebGLRenderingContext, images: Array<HTMLImageElement>) {
            const uNumber = 180
            const vNumber = 180
            
            const EarthInfo = sphere(uNumber, vNumber)

            const attributes = {
                texcoord: EarthInfo.uvs,
                normal: EarthInfo.normals,
                position: EarthInfo.positions,
            }

            const uniforms = {
                u_matrix: m4.identity(),
                u_worldViewProjection: m4.identity(),
                u_worldInverseTransposeMatrix: m4.identity(),
                u_reverseLightDirection: m4.normalize([-1, 0, 0]),
            }

            const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
        
            const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes)
            if (!programInfo) return

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            // pixelStorei 图像预处理的函数
            // 图片上下对称翻转坐标轴
            // 解决坐标系 Y 轴翻转导致的纹理渲染异常（Y轴翻转）
            // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/pixelStorei
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
            
            // 给纹理绑定图片
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);

            requestAnimationFrame(drawSence)

            function drawSence(time: number) {
                time *= 0.01;
                if (!gl) return
                webglUtils.resize(gl)
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.enable(gl.CULL_FACE)
                gl.enable(gl.DEPTH_TEST)

                const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                const zNear = 1;
                const zFar = 2000;
                const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

                const cameraMatrix = computeCameraMatrix()

                const viewMatrix = m4.inverse(cameraMatrix);

                const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

                let worldMatrix = m4.identity()
                
                worldMatrix = m4.translate(worldMatrix, tx.value, ty.value, tz.value);
                worldMatrix = m4.xRotate(worldMatrix, rx.value);
                worldMatrix = m4.yRotate(worldMatrix, time);
                worldMatrix = m4.zRotate(worldMatrix, rz.value);
                worldMatrix = m4.scale(worldMatrix, ss.value, ss.value, ss.value)

                const worldInverseMatrix = m4.inverse(worldMatrix);

                uniforms.u_worldViewProjection = m4.multiply(viewProjectionMatrix, worldMatrix)
                uniforms.u_worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

                if (programInfo?.program) {
                    gl.useProgram(programInfo.program)

                    webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo)

                    webglUtils.setUniforms(programInfo, uniforms)

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