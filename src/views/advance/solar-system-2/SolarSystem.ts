import SolarNode from './Node'
import m4 from '../../../utils/m4'
import { cube } from '../../../utils/shape'
import webglUtils from '../../../utils/webglUtils'
import { ProgramInfo } from '../../../utils/webglUtils.d'

// 优化：
// 优化太阳系结构， 从 太阳 - 地球 - 月球
// 改为
//       太阳系
//        |- 太阳
//        |- 地月系统
//        |    |- 地球
//        |    |- 月球系统
//        |    |    |- 月球
// 这样能避免 太阳 地球的自传 影响下级
export function createSolarSystem(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
    const sunSystem = new SolarNode()
    const earthOrbit = new SolarNode()
    const moonthOrbit = new SolarNode()

    earthOrbit.localMatrix = m4.translation(80, 0, 0)
    moonthOrbit.localMatrix = m4.translation(-20, 0, 0)

    earthOrbit.updateFn = function(node) {
        node.localMatrix = m4.multiply(m4.yRotation(0.001), node.localMatrix)
    }

    moonthOrbit.updateFn = function(node) {
        node.localMatrix = m4.multiply(m4.yRotation(0.012), node.localMatrix)
    }


    const sun = new SolarNode(
        m4.translation(0, 0, 0),
        {
            programInfo: programInfo,
            uniforms: {
                u_color: [255, 0, 0],
                u_matrix: m4.identity()
            },
            bufferInfo: webglUtils.createBufferInfoFromArrays(gl, {
                position: cube(20, 20, 20)
            })
        },
        function(node: SolarNode) {
            // node.localMatrix = m4.multiply(m4.yRotation(0.01), node.localMatrix)
        }
    ) 
    const earth = new SolarNode(
        m4.translation(0, 0, 0),
        {
            programInfo: programInfo,
            uniforms: {
                u_color: [0, 0, 255],
                u_matrix: m4.identity()
            },
            bufferInfo: webglUtils.createBufferInfoFromArrays(gl, {
                position: cube(14, 14, 14)
            })
        },
        function(node: SolarNode) {
            node.localMatrix = m4.multiply(m4.yRotation(0.1), node.localMatrix)
        }
    )
    const moonth = new SolarNode(
        m4.translation(0, 0, 0),
        {
            programInfo: programInfo,
            uniforms: {
                u_color: [255, 255, 255],
                u_matrix: m4.identity()
            },
            bufferInfo: webglUtils.createBufferInfoFromArrays(gl, {
                position: cube(10, 10, 10)
            })
        },
        function(node: SolarNode) {
            // node.localMatrix = m4.multiply(m4.yRotation(-0.01), node.localMatrix)
        }
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