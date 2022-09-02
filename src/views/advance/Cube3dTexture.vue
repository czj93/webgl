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
import { cube } from '../../utils/shape'
  
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
    uniform mat4 u_matrix;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    void main() {
        gl_Position = u_matrix * a_position;
        v_texCoord = a_texCoord;
    }
`
  
// 片段着色器
const fragementShaderSource = `
    // 设置精度
    precision mediump float;

    uniform sampler2D u_image;

    varying vec2 v_texCoord;

    void main() {
        gl_FragColor = texture2D(u_image, v_texCoord);
    }
`
// gl: WebGLRenderingContext,
function loadImage(src: string, callback: (image: HTMLImageElement) => void) {
    const image = new Image()

    image.src = src
    image.onload = function() {
        // render(image, gl);
        callback && callback(image)
    };
}
  
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

        const cubeAttribute = {
        texCoord: [
            0.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
            1.0,  1.0,
            0.0,  0.0,
            1.0,  0.0,

            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,

            1.0,  0.0,
            0.0,  1.0,
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,

            1.0,  0.0,
            0.0,  1.0,
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,

            1.0,  0.0,
            0.0,  1.0,
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,

            1.0,  0.0,
            0.0,  1.0,
            0.0,  0.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ],
            color: {
                numComponents: 3,
                data: randColor(6, 6, cubeColors),
            },
            position: cube(120, 120, 120)
        }

        const cubeUniforms = {
            u_matrix: m4.identity()
        }

        const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
    
        const cubeBufferInfo = webglUtils.createBufferInfoFromArrays(gl, cubeAttribute)

        if (!programInfo) return
        let img: HTMLImageElement;
        loadImage('/lena.jpeg', (image) => {
            img = image
            requestAnimationFrame(drawScene)
        })


        function drawScene(time: number) {
            time *= 0.01;

            const cubeXRotation   = time;
            const cubeYRotation   =  -time;

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
                    cubeUniforms.u_matrix = m4.translate(cubeUniforms.u_matrix, 175, 175, 0);
                    //   cubeUniforms.u_matrix = m4.xRotate(cubeUniforms.u_matrix, cubeXRotation);
                    //   cubeUniforms.u_matrix = m4.yRotate(cubeUniforms.u_matrix, cubeYRotation);
                    cubeUniforms.u_matrix = m4.xRotate(cubeUniforms.u_matrix, rx.value);
                    cubeUniforms.u_matrix = m4.yRotate(cubeUniforms.u_matrix, ry.value);
                    cubeUniforms.u_matrix = m4.zRotate(cubeUniforms.u_matrix, rz.value);
                    cubeUniforms.u_matrix = m4.scale(cubeUniforms.u_matrix, sx.value, sy.value, sz.value);
                
                    cubeUniforms.u_matrix = m4.translate(cubeUniforms.u_matrix, -60, -60, -60);

                    webglUtils.setUniforms(programInfo, cubeUniforms)

                    var texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

                    gl.drawArrays(gl.TRIANGLES, 0, 6*6)


                    requestAnimationFrame(drawScene)
                }
            }
        }

    }
}
  
</script>