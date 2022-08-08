/**
 * 创建一个着色器程序
 * @param gl webgl 上下文
 * @param type 着色器类型
 * @param source 着色器代码
 * @returns 
 */
export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    // 创建着色器
    const shader = gl.createShader(type)
    if (shader) {
        // 提供着色器程序
        gl.shaderSource(shader, source)
        // 编译着色器
        gl.compileShader(shader)
        // 查询着色器信息 gl.COMPILE_STATUS 查询是否编译完成
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            // Something went wrong during compilation; get the error
            const lastError = gl.getShaderInfoLog(shader);
            console.error(`
                *** Error compiling shader ***
                ${lastError}
                ${source.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n')}
            `)
            gl.deleteShader(shader);
            return null;
        }
        return shader
    }
    return null
}


/**
 * 创建着色器程序
 * @param gl webgl 上下文
 * @param vertexShader 顶点着色器
 * @param fragementShader 片段着色器
 * @returns 
 */
export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragementShader: WebGLShader) {
    const program = gl.createProgram()
    if (program) {
        // 给着色器程序添加 顶点着色器
        gl.attachShader(program, vertexShader)
        // 给着色器程序添加 片段着色器
        gl.attachShader(program, fragementShader)
        // 链接着色器程序 完成着色器程序准备GPU代码
        gl.linkProgram(program)
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
        if (!linked) {
            const lastError = gl.getProgramInfoLog(program);
            console.error('Error in program linking: \n' + lastError);
    
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }
    return null
}


export function createProgramFromShaderSource(gl: WebGLRenderingContext, vertexShaderSource: string, fragementShaderSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragementShader = createShader(gl, gl.FRAGMENT_SHADER, fragementShaderSource)

    if (vertexShader && fragementShader) {
        return createProgram(gl, vertexShader, fragementShader)
    }
}

function resize(gl: WebGLRenderingContext) {
    var realToCSSPixels = window.devicePixelRatio;
  
    // 获取浏览器显示的画布的CSS像素值
    // 然后计算出设备像素设置drawingbuffer
    var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);
  
    // 检查画布尺寸是否相同
    if (gl.canvas.width  !== displayWidth ||
        gl.canvas.height !== displayHeight) {
  
      // 设置为相同的尺寸
      gl.canvas.width  = displayWidth;
      gl.canvas.height = displayHeight;
    }
  }
  

export default {
    resize,
    createShader,
    createProgram,
    createProgramFromShaderSource
}