<template>
  <div>
    <canvas />
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import webglUtils from '../../utils/webglUtils'

onMounted(main)

function main() {
    const canvas = document.querySelector('canvas')
    if (canvas) {
        const gl = canvas.getContext('webgl')
        if (!gl) return

        const vertexShaderSource = `
            // 一个属性值，将会从缓冲中获取数据
            attribute vec4 a_position;
            uniform vec2 u_resolution;
            
            // 所有着色器都有一个main方法
            void main() {
            
                // 从像素坐标转换到 0.0 到 1.0
                vec2 zeroToOne = a_position.xy / u_resolution;
            
                // 再把 0->1 转换 0->2
                vec2 zeroToTwo = zeroToOne * 2.0;
            
                // 把 0->2 转换到 -1->+1 (裁剪空间)
                vec2 clipSpace = zeroToTwo - 1.0;
            
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            }
        `

        const fragementShaderSource = `
            // 片断着色器没有默认精度，所以我们需要设置一个精度
            // mediump是一个不错的默认值，代表“medium precision”（中等精度）
            precision mediump float;
            
            void main() {
                // gl_FragColor是一个片断着色器主要设置的变量
                gl_FragColor = vec4(0.1098, 0.38039, 0.5, 0.92156); // 返回“ 蓝色 ”
            }
        `

        // 创建 着色器程序
        const program = webglUtils.createProgramFromShaderSource(gl, vertexShaderSource, fragementShaderSource)
        if (!program) return
        // 从着色器程序中找到变量 a_position 的位置
        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        
        // 创建一个缓冲
        const positionBuffer = gl.createBuffer()
        // 绑定缓冲的数据源
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        // 创建顶点数据
        const positions = [
            10, 20,
            80, 20,
            10, 30,
        ]
        // 向缓冲中存放数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

        webglUtils.resize(gl)

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        gl.clearColor(0, 0, 0, 0)

        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.useProgram(program)

        // 可以从的缓冲中获取数据给着色器中的属性
        gl.enableVertexAttribArray(positionAttributeLocation)

        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 3;
        gl.drawArrays(primitiveType, offset, count);
        let time = 0
        const animation = function() {
            draw(gl, positions)
            time++
            if (time < 100) {
                requestAnimationFrame(animation)
            }
        }
        requestAnimationFrame(animation)
    }
}

function draw(gl: WebGLRenderingContext, positions: Array<number>){
    positions[2] += 1
    positions[5] += 1
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
}
</script>