import { ProgramInfo, BufferType, BufferInfo, UsageBuffer, BufferData, UniformSetters, AttributeSetters, AttribPointer, AddAttribPointer, UpdateAttribPointer, AttributeValues, OptMapping } from './webglUtils.d'

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


/**
 * 根据着色器源码创建 着色器程序
 * @param gl webgl 上下文
 * @param vertexShaderSource 顶点着色器源码
 * @param fragementShaderSource 片段着色器源码
 * @returns 
 */
export function createProgramFromShaderSource(gl: WebGLRenderingContext, vertexShaderSource: string, fragementShaderSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragementShader = createShader(gl, gl.FRAGMENT_SHADER, fragementShaderSource)

    if (vertexShader && fragementShader) {
        return createProgram(gl, vertexShader, fragementShader)
    }
}

/**
 * 
 * @param gl webgl 上下文
 * @param arrays attribute变量信息对象
 * @param optMapping 可选，attribute js 字段名 与 glsl 中变量名的映射关系
 * @returns 
 */
export function createBufferInfoFromArrays(gl: WebGLRenderingContext, arrays: AttributeValues, optMapping?: OptMapping) {
    const bufferInfo = {
        attribs: createAttribsFromArrays(gl, arrays, optMapping),
    };
    return bufferInfo
}

function createAttribsFromArrays(gl: WebGLRenderingContext, arrays: AttributeValues, optMapping?: OptMapping) {
    const mapping = optMapping || createMapping(arrays)
    const attribs: Record<string, AddAttribPointer> = {};

    Object.keys(mapping).forEach(attribName => {
        const bufferName = mapping[attribName];
        const originValue = arrays[bufferName]
        

        const bufferData = makeTypedArray(originValue, bufferName)
        const buffer = createBufferFromTypedArray(gl, bufferData)
        if (buffer) {
            attribs[attribName] = {
                buffer,
                type: getGLTypeForTypedArray(gl, bufferData),
                normalize: getNormalizationForTypedArray(bufferData),
                numComponents: guessNumComponentsFromName(bufferName, originValue.length),
            }
        }
    })

    return attribs
}

function getNormalizationForTypedArray(typedArray: Object) {
    if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
    return false;
  }

function getGLTypeForTypedArray(gl: WebGLRenderingContext, typedArray: Object) {
    if (typedArray instanceof Int8Array)    { return gl.BYTE; }            // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
    if (typedArray instanceof Int16Array)   { return gl.SHORT; }           // eslint-disable-line
    if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
    if (typedArray instanceof Int32Array)   { return gl.INT; }             // eslint-disable-line
    if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }    // eslint-disable-line
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
    throw 'unsupported typed array type';
}

function makeTypedArray(value: Array<number>, name: string) {
    if (name.includes('color')) {
        return new Uint8Array(value)
    }
    return new Float32Array(value)
}

function guessNumComponentsFromName(name: string, length: number) {
    let numComponents;
    if (name.indexOf('coord') >= 0) {
      numComponents = 2;
    } else if (name.indexOf('color') >= 0) {
      numComponents = 3;
    } else {
      numComponents = 3;  // position, normals, indices ...
    }

    if (length % numComponents > 0) {
      throw 'can not guess numComponents. You should specify it.';
    }

    return numComponents;
}

function createMapping(obj: Object): OptMapping {
    const mapping: OptMapping = {}
    Object.keys(obj).forEach(key => {
        mapping[`a_${key}`] = key
    })
    return mapping
}

function createBufferFromTypedArray(gl: WebGLRenderingContext, array: BufferData, type?: BufferType, drawType?: UsageBuffer) {
    type = type || gl.ARRAY_BUFFER;
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
    return buffer;
  }


function createProgramInfo(gl: WebGLRenderingContext, vertexShaderSource: string, fragementShaderSource: string): ProgramInfo | null {
    const program = createProgramFromShaderSource(gl, vertexShaderSource, fragementShaderSource)
    if (!program) return null
    const uniformSetters = createUniformSetters(gl, program);
    const attribSetters = createAttributeSetters(gl, program);

    return {
        program,
        uniformSetters,
        attribSetters
    }
}

/**
 * 设置 Attribute 变量
 * @param gl 
 * @param programInfo 
 * @param bufferInfo 
 */
export function setBuffersAndAttributes(gl: WebGLRenderingContext, programInfo: ProgramInfo, bufferInfo: BufferInfo) {

    Object.keys(bufferInfo.attribs).forEach(name => {
        const setter = programInfo.attribSetters[name]
        if (setter) {
            setter(bufferInfo.attribs[name])
        }
    })
}

/**
 * 设置 Uniform 变量
 * 
 * const uniforms = {
 *      u_matrix: m4.identity()
 * }
 * 
 * @param programInfo 
 * @param values uniform 的变量值
 */
export function setUniforms(programInfo: ProgramInfo, ...values: Array<Record<string, Array<number>>>) {
    const setters = programInfo.uniformSetters
    for (const uniforms of values) {
        Object.keys(uniforms).forEach(function(name) {
            const setter = setters[name];
            if (setter) {
                setter(uniforms[name]);
            }
        });
    }
}

function createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
    const uniformSetters: UniformSetters = {}
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for(let i = 0; i < uniformCount; i++) {
        const uniformInfo = gl.getActiveUniform(program, i)
        if (!uniformInfo) break
        let { name } = uniformInfo

        // remove the array suffix.
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }

        const setter = createUniformSetter(gl, program, uniformInfo)
        if (setter) uniformSetters[name] = setter
    }
    return uniformSetters
}

/**
 * 创建Uniform Setter
 * @param gl 
 * @param program 
 * @param uniformInfo 
 * @returns 
 */
function createUniformSetter(gl: WebGLRenderingContext, program: WebGLProgram, uniformInfo: WebGLActiveInfo) {
    const { name, type } = uniformInfo
    const location = gl.getUniformLocation(program, name)
    // 判断 uniform 是否是数组
    const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');

    return (v: number | Array<number>) => {

        if (v instanceof Array) {
            if (type === gl.FLOAT)  gl.uniform1fv(location, v)
            if (type === gl.FLOAT_VEC2)  gl.uniform2fv(location, v)
            if (type === gl.FLOAT_VEC3)  gl.uniform3fv(location, v)
            if (type === gl.FLOAT_VEC4)  gl.uniform4fv(location, v)

            if (type === gl.INT)  gl.uniform1iv(location, v);
            if (type === gl.INT_VEC2)  gl.uniform2iv(location, v)
            if (type === gl.INT_VEC3)  gl.uniform3iv(location, v)
            if (type === gl.INT_VEC4)  gl.uniform4iv(location, v)

            if (type === gl.BOOL) gl.uniform1iv(location, v);
            if (type === gl.BOOL_VEC2) gl.uniform2iv(location, v);
            if (type === gl.BOOL_VEC3) gl.uniform3iv(location, v);
            if (type === gl.BOOL_VEC4) gl.uniform4iv(location, v);

            if (type === gl.FLOAT_MAT2) gl.uniformMatrix2fv(location, false, v);
            if (type === gl.FLOAT_MAT3) gl.uniformMatrix3fv(location, false, v);
            if (type === gl.FLOAT_MAT4) gl.uniformMatrix4fv(location, false, v);
        } else {
            if (type === gl.FLOAT)  gl.uniform1f(location, v)
            if (type === gl.INT)  gl.uniform1i(location, v);
        }
    }
}

function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
    const attributeSetters: AttributeSetters = {}
    const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    for(let i=0; i < attributeCount; i++) {
        const attributeInfo = gl.getActiveAttrib(program, i)
        if (!attributeInfo) break
        attributeSetters[attributeInfo.name] = createAttribSetter(gl, program, attributeInfo)
    }
    return attributeSetters
}

function createAttribSetter(gl: WebGLRenderingContext, program: WebGLProgram, attributeInfo: WebGLActiveInfo) {
    const location = gl.getAttribLocation(program, attributeInfo.name)

    const isUpdateAttribPointer = (data: any): data is UpdateAttribPointer => {
        if (data.value) {
            return true
        }
        return false
    }

    const isAddAttribPointer = (data: any): data is AddAttribPointer => {
        if (!data.value) {
            return true
        }
        return false
    }

    return (data: AttribPointer) => {
        if (isUpdateAttribPointer(data)) {
          gl.disableVertexAttribArray(location);
          switch (data.value.length) {
            case 4:
              gl.vertexAttrib4fv(location, data.value);
              break;
            case 3:
              gl.vertexAttrib3fv(location, data.value);
              break;
            case 2:
              gl.vertexAttrib2fv(location, data.value);
              break;
            case 1:
              gl.vertexAttrib1fv(location, data.value);
              break;
            default:
              throw new Error('the length of a float constant value must be between 1 and 4!');
          }
        }
        if (isAddAttribPointer(data)){
          gl.bindBuffer(gl.ARRAY_BUFFER, data.buffer);
          gl.enableVertexAttribArray(location);
          gl.vertexAttribPointer(
            location, data.numComponents || data.size || 2, data.type || gl.FLOAT, data.normalize || false, data.stride || 0, data.offset || 0);
        }
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
    setUniforms,
    setBuffersAndAttributes,
    createProgramInfo,
    createBufferInfoFromArrays,
    createProgramFromShaderSource
}