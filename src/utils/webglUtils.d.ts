export interface ProgramInfo {
    program: WebGLProgram;
    attribSetters: AttributeSetters;
    uniformSetters: UniformSetters;
}

export type UniformSetters = {
    [key: string]: (value: number | Array<number>) => void | null
}

export type AttributeSetters = {
    [key: string]: (data: AttribPointer) => void
}

export interface BufferInfo {
    attribs: Record<string, AddAttribPointer>
}

export type AttribPointer = AddAttribPointer | UpdateAttribPointer

export interface AddAttribPointer {
    buffer: WebGLBuffer;
    numComponents?: number;
    size?: number;
    type?: number;
    normalize?: boolean;
    stride?: number;
    offset?: number;
}

export interface UpdateAttribPointer {
    value: Float32Array;
}

export interface AttributeValues {
    [key: string]: Array<number>
}

export interface OptMapping {
    [key: string]: string
}

export type BufferType = WebGLRenderingContextBase.ARRAY_BUFFER | WebGLRenderingContextBase.ELEMENT_ARRAY_BUFFER

export type UsageBuffer = 
    // 缓冲区的内容可能经常使用，而不会经常更改。内容被写入缓冲区，但不被读取
    WebGLRenderingContextBase.STATIC_DRAW |
    // 缓冲区的内容可能经常被使用，并且经常更改。内容被写入缓冲区，但不被读取
    WebGLRenderingContextBase.DYNAMIC_DRAW |
    // 缓冲区的内容可能不会经常使用。内容被写入缓冲区，但不被读取
    WebGLRenderingContextBase.STREAM_DRAW

export type BufferData = ArrayBuffer<number> | ArrayBufferView<number> | SharedArrayBuffer<number>