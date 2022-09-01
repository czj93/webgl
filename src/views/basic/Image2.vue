<template>
    <div>
        <canvas></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import webglUtils from '../../utils/webglUtils';
import m3 from '../../utils/m3';

onMounted(main)

// 全局变量默认为 0 所以 u_image 默认使用纹理单元 0 。 
// 纹理单元 0 默认为当前活跃纹理，所以调用 bindTexture 会将纹理绑定到单元 0 。

const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    uniform mat3 u_matrix;
    
    void main() {
        //gl_Position = vec4((u_matrix * a_position).xy, 0, 1);
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        // 将纹理坐标传给片断着色器
        // GPU会在点之间进行插值
        v_texCoord = a_texCoord;
    }
`

const fragementShaderSource = `
    precision mediump float;
    
    // 纹理
    uniform sampler2D u_image0;
    uniform sampler2D u_image1;
    
    // 从顶点着色器传入的纹理坐标
    varying vec2 v_texCoord;
    
    void main() {
        // 在纹理上寻找对应颜色值
        vec4 color0 = texture2D(u_image0, v_texCoord);
        vec4 color1 = texture2D(u_image1, v_texCoord);
        gl_FragColor = color0 * color1;
        //gl_FragColor = vec4(0, 1, 0, 1);
        
    }
`

function loadImage(src: string, callback: (this: GlobalEventHandlers, ev: Event) => any) {
    const image = new Image()
    image.src = src
    image.onload = callback;
    return image
}

function loadImages(urls: Array<string>, callback: (images: Array<HTMLImageElement>) => void) {
  var images: Array<HTMLImageElement> = [];
  var imagesToLoad = urls.length;

  var onImageLoad = function() {
    --imagesToLoad;
    if (imagesToLoad === 0) {
      callback(images);
    }
  };

  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}


function setRectangle(x: number, y: number, width: number, height: number) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  return [
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]
}


function render(images: Array<HTMLImageElement>, gl: WebGLRenderingContext) {
    const image = images[0]
    const attributes = {
        texCoord: [
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ],
        position: {
            numComponents: 2,
            data: setRectangle(0, 0, image.width, image.height),
        }
    }

    const uniforms = {
        u_matrix: m3.identity()
    }

    const programInfo = webglUtils.createProgramInfo(gl, vertexShaderSource, fragementShaderSource)
    const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, attributes)

    webglUtils.resize(gl)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    uniforms.u_matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);


    if (programInfo?.program) {
        gl.useProgram(programInfo.program)
        webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo)

        var textures = [];
        for (var ii = 0; ii < 2; ++ii) {
            // 创建贴图
            var texture = gl.createTexture();
            // 绑定纹理  TEXTURE_2D/二维纹理 TEXTURE_CUBE_MAP/立方体映射纹理
            gl.bindTexture(gl.TEXTURE_2D, texture);
            
            // 设置纹理参数
            // Set the parameters so we can render any size image.
            // texParameteri(target, pname, param)
            // target/类型  pname/参数 param/参数值
            // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/texParameter
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            // 给纹理绑定图片
            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

            // add the texture to the array of textures.
            textures.push(texture);
        }

        // 获取全局变量的位置
        var u_image0Location = gl.getUniformLocation(programInfo.program, "u_image0");
        var u_image1Location = gl.getUniformLocation(programInfo.program, "u_image1");

        // 给全局变量指定纹理单元
        gl.uniform1i(u_image0Location, 0);  // texture unit 0
        gl.uniform1i(u_image1Location, 1);

        // 激活纹理单元
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[1]);

        webglUtils.setUniforms(programInfo, uniforms)

        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

}

function main() {
    const gl = webglUtils.getWebGLContext()
    if (!gl) return

    // loadImage('/lena.jpeg', gl)
    loadImages([
        '/leaves.jpg',
        '/star.jpg',
    ], (images) => {
        render(images, gl)
    })
}
</script>