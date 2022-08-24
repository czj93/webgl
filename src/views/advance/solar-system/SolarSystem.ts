import SolarNode from './Node'
import m4 from '../../../utils/m4'
import { cube } from '../../../utils/shape'
import webglUtils from '../../../utils/webglUtils'
import { ProgramInfo } from '../../../utils/webglUtils.d'


export function createSolarSystem(gl: WebGLRenderingContext, programInfo: ProgramInfo) {
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
            node.localMatrix = m4.multiply(m4.yRotation(0.01), node.localMatrix)
        }
    )
    const earth = new SolarNode(
        m4.translation(100, 0, 0),
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
            node.localMatrix = m4.multiply(m4.yRotation(0.001), node.localMatrix)
        }
    )
    const moonth = new SolarNode(
        m4.translation(-30, 0, 0),
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
            node.localMatrix = m4.multiply(m4.yRotation(0.01), node.localMatrix)
        }
    )
    
    moonth.setParent(earth)
    earth.setParent(sun)

    class SolarSystem {
        node: SolarNode = sun

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