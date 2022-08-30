<template>
  <div>
    <div>
      <canvas style="border: 1px solid #222" />
    </div>

    <div>
      旋转：<span>{{ angleValue }}</span>
      <input type="range" min="0" max="360" v-model="angleValue" />
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
import { onMounted, ref } from "vue";
import webglUtils from "../../utils/webglUtils";
import m3 from "../../utils/m3";
import { ProgramInfo } from "../../utils/webglUtils.d";

onMounted(main);

const angleValue = ref(0);
const mx = ref(100);
const my = ref(100);
const sx = ref(1);
const sy = ref(1);

function setRectangle(x: number, y: number, width: number, height: number) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  return [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2];
}

function main() {
  const canvas = document.querySelector("canvas");
  if (canvas) {
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vertexShaderSource = `
              // 一个属性值，将会从缓冲中获取数据
              attribute vec2 a_position;
              uniform mat3 u_matrix;
              
              // 所有着色器都有一个main方法
              void main() {          
                  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
              }
          `;

    const fragementShaderSource = `
              // 片断着色器没有默认精度，所以我们需要设置一个精度
              // mediump是一个不错的默认值，代表“medium precision”（中等精度）
              precision mediump float;
              
              void main() {
                  // gl_FragColor是一个片断着色器主要设置的变量
                  gl_FragColor = vec4(0.1098, 0.38039, 0.5, 0.92156); // 返回“ 蓝色 ”
              }
          `;

    // 创建 着色器程序
    const programInfo = webglUtils.createProgramInfo(
      gl,
      vertexShaderSource,
      fragementShaderSource
    );

    if (!programInfo) return;

    const attributes = {
      position: {
        numComponents: 2,
        data: setRectangle(0, 0, 100, 60),
      },
    };

    const uniforms = {
      u_matrix: m3.identity(),
    };

    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes);

    draw(gl, programInfo);

    const animation = () => {
      draw(gl, programInfo);
      requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);

    function draw(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
      webglUtils.resize(gl);

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.clearColor(0, 0, 0, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);

      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

      uniforms.u_matrix = m3.projection(
        gl.canvas.clientWidth,
        gl.canvas.clientHeight
      );
      //   // 平移
      //   matrix = m3.translate(matrix, mx.value, my.value)
      //   // 旋转
      //   matrix = m3.rotate(matrix, angleValue.value)
      //   // 缩放
      //   matrix = m3.scale(matrix, sx.value, sy.value)
      // 矩阵变化操作的顺序的变化是否会影响最终的结果?
      // 平移变化是怎么改变旋转的圆心的?
      // 改变旋转圆心
      // matrix = m3.translate(matrix, -30, -50)

      webglUtils.setUniforms(programInfo, uniforms);

      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }
}
</script>
