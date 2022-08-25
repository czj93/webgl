import SolarNode from './Node'
import m4 from '../../../utils/m4'
import { cube } from '../../../utils/shape'
import webglUtils from '../../../utils/webglUtils'
import { ProgramInfo } from '../../../utils/webglUtils.d'

// 优化：
// 修改旋转原点
export function createSolarSystem(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
    const sunSystem = new SolarNode()
    const earthOrbit = new SolarNode()
    const moonthOrbit = new SolarNode()

    const sunR = 20
    const earthR= 14
    const moonthR = 10

    earthOrbit.localMatrix = m4.translation(70, 0, 0)
    moonthOrbit.localMatrix = m4.translation(-20, 0, 0)

    earthOrbit.updateFn = function(node) {
        node.localMatrix = m4.multiply(m4.yRotation(0.001), node.localMatrix)
    }

    moonthOrbit.updateFn = function(node) {
        node.localMatrix = m4.multiply(m4.yRotation(0.012), node.localMatrix)
    }


    const sun = new SolarNode(
        // 修改旋转原点
        m4.translation(-sunR/2, -sunR/2, -sunR/2),
        {
            programInfo: programInfo,
            uniforms: {
                u_color: [255, 0, 0],
                u_matrix: m4.identity()
            },
            bufferInfo: webglUtils.createBufferInfoFromArrays(gl, {
                position: cube(sunR, sunR, sunR)
            })
        },
        function(node: SolarNode) {
            node.localMatrix = m4.multiply(m4.yRotation(0.005), node.localMatrix)
        }
    ) 
    const earth = new SolarNode(
        // 修改旋转原点
        // m4.translation(0, 0, 0),
        m4.translation(-earthR/2, -earthR/2, -earthR/2),
        {
            programInfo: programInfo,
            uniforms: {
                u_color: [0, 0, 255],
                u_matrix: m4.identity()
            },
            bufferInfo: webglUtils.createBufferInfoFromArrays(gl, {
                position: cube(earthR, earthR, earthR)
            })
        },
        function(node: SolarNode) {
            // 注意 multiply 操作 两个矩阵入参的顺序
            // 调整顺序会得到不一样的结果
            node.localMatrix = m4.multiply(m4.yRotation(0.1), node.localMatrix)
            // node.localMatrix = m4.multiply(node.localMatrix, m4.yRotation(0.1))
        }
    )
    const moonth = new SolarNode(
        // 修改旋转圆心
        m4.translation(-moonthR/2, -moonthR/2, -moonthR/2),
        {
            programInfo: programInfo,
            uniforms: {
                u_color: [255, 255, 255],
                u_matrix: m4.identity()
            },
            bufferInfo: webglUtils.createBufferInfoFromArrays(gl, {
                position: cube(moonthR, moonthR, moonthR)
            })
        },
        function(node: SolarNode) {}
    )
    

    moonth.setParent(moonthOrbit)
    earth.setParent(earthOrbit)
    moonthOrbit.setParent(earthOrbit)
    sun.setParent(sunSystem)
    earthOrbit.setParent(sunSystem)

    class SolarSystem {
        node: SolarNode = sunSystem

        each(item: SolarNode, before?: (node: SolarNode) => void) {
            before && before(item)
            if (item.children) {
                item.children.forEach(node => {
                    this.each(node, before)
                })
            }
        }
    }

    return new SolarSystem()
}