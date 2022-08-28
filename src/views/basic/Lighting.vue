<template>
    <div>
        <div>
            <canvas></canvas>
        </div>
        <div class="contral-wrap">
            <div>操作物体</div>
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
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import m4 from '../../utils/m4';
import { cube, cubeNormals } from '../../utils/shape'
import webglUtils from '../../utils/webglUtils';

onMounted(main)

const rx = ref(0)
const ry = ref(0)
const rz = ref(0)

const ctz = ref(500)

const crx = ref(0)
const cry = ref(0)
const crz = ref(0)

const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec3 a_normal;

    varying vec4 v_color;
    varying vec3 v_normal;

    uniform mat4 u_worldInverseTransposeMatrix;
    uniform mat4 u_worldViewProjection;

    void main() {
        gl_Position = u_worldViewProjection * a_position;
        v_color = a_color;
        v_normal = mat3(u_worldInverseTransposeMatrix) * a_normal;
    }
`

// 片段着色器
const fragementShaderSource = `
    // 设置精度
    precision mediump float;

    varying vec4 v_color;
    varying vec3 v_normal;
    uniform vec3 u_reverseLightDirection;

    void main() {
        // 单位化 法向量
        vec3 normal = normalize(v_normal);

        // 将法线和光照方向点乘， 得到法线和光照的夹角余弦值
        // light 可以理解为光照强度
        float light = dot(normal, u_reverseLightDirection);

        gl_FragColor = v_color;
        // 将颜色乘上光照强度 就可得到最终的颜色了
        gl_FragColor.rgb *= light;
    }
`

  var fieldOfViewRadians = webglUtils.degToRad(60);
  var fRotationRadians = 0;

function computeCameraMatrixByLookAt() {
    // 摄像机观察目标
    var target = [0, 0, 0];
    var up = [0, 1, 0];

    var cameraMatrix = m4.xRotation(webglUtils.degToRad(crx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, cry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, crz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, ctz.value);
    var cameraPosition = [
        cameraMatrix[12],
        cameraMatrix[13],
        cameraMatrix[14],
    ]
    
    cameraMatrix = m4.lookAt(cameraPosition, target, up);
    return cameraMatrix
}

function computeCameraMatrix() {
    var cameraMatrix = m4.xRotation(webglUtils.degToRad(crx.value));
    cameraMatrix = m4.yRotate(cameraMatrix, cry.value)
    cameraMatrix = m4.zRotate(cameraMatrix, crz.value)
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, ctz.value);
    return cameraMatrix
}

function main() {
    const gl = webglUtils.getWebGLContext('canvas')
    if (gl) {
        const attributes = {
            color: {
                numComponents: 3,
                data: webglUtils.randColors(6, 6, [
                    // 底 绿
                    [0, 255, 0],
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
                ])
            },
            position: cube(40, 40, 40),
            normal: cubeNormals(),
        }

        const uniforms = {
            u_worldInverseTransposeMatrix: m4.identity(),
            u_worldViewProjection: m4.identity(),
            u_reverseLightDirection: m4.normalize([0, 0, 1]),
        }

        const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)

        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes)

        requestAnimationFrame(drawSence)

        function drawSence() {
            if (gl) {
                webglUtils.resize(gl)
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                gl.enable(gl.CULL_FACE)
                gl.enable(gl.DEPTH_TEST)

                if (programInfo?.program) {
                    gl.useProgram(programInfo.program)

                    webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo)

                    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
                    var zNear = 1;
                    var zFar = 2000;
                    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

                    // var camera = [0, 10, 0];
                    // var target = [0, 0, 0];
                    // var up = [0, 1, 0];
                    // var cameraMatrix = computeCameraMatrixByLookAt();
                    var cameraMatrix = computeCameraMatrix()

                    var viewMatrix = m4.inverse(cameraMatrix);

                    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)
                    
                    let worldMatrix = m4.identity()

                    // worldMatrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
                    // worldMatrix = m4.translate(worldMatrix, 175, 175, 0);
                    worldMatrix = m4.xRotate(worldMatrix, rx.value);
                    worldMatrix = m4.yRotate(worldMatrix, ry.value);
                    worldMatrix = m4.zRotate(worldMatrix, rz.value);

                    // 修改旋转圆心
                    worldMatrix = m4.translate(worldMatrix, -20, -20, -20);
                    uniforms.u_worldViewProjection = m4.multiply(viewProjectionMatrix, worldMatrix)
                    
                    var worldInverseMatrix = m4.inverse(worldMatrix);
                    uniforms.u_worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

                    
                    webglUtils.setUniforms(programInfo, uniforms)

                    gl.drawArrays(gl.TRIANGLES, 0, 6*6)
                }
                requestAnimationFrame(drawSence)
            }
        }
    }
}
</script>