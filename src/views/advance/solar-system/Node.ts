import m4 from '../../../utils/m4'
import { ProgramInfo, AddAttribPointer } from '../../../utils/webglUtils.d'

interface DrawInfo {
    programInfo: ProgramInfo;
    uniforms:  Record<string, Array<number>>
    bufferInfo: {
        attribs: Record<string, AddAttribPointer>;
    }
}

export default class SolarNode {
    name: string = ''
    parent?: SolarNode
    children: Array<SolarNode> = []
    localMatrix: Array<number> = m4.identity()
    worldMatrix: Array<number> = m4.identity()

    updateFn: (node:SolarNode) => void = () => {}

    drawInfo?: DrawInfo

    constructor(localMatrix?: Array<number>, drawInfo?: DrawInfo, updateFn?: (node:SolarNode) => void) {
        if(localMatrix) this.localMatrix = localMatrix
        if(drawInfo) this.drawInfo = drawInfo
        if (updateFn) this.updateFn = updateFn
    }

    setParent(parent: SolarNode) {
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            if (index >= 0) {
                this.parent.children.splice(index, 1);
            }
        }
        // 添加到新的父节点上
        if (parent) {
            parent.children.push(this);
        }
        this.parent = parent;
    }

    updateWorldMatrix(parentWorldMatrix?: Array<number>) {
        if (parentWorldMatrix) {
            this.worldMatrix = m4.multiply(parentWorldMatrix, this.localMatrix)
        } else {
            this.worldMatrix = this.localMatrix.slice(0)
        }

        if (this.children && this.children.length) {
            this.children.forEach(child => {
                child.updateWorldMatrix(this.worldMatrix)
            })
        }
    }

    update() {
        this.updateFn && this.updateFn(this)
        this.children.forEach(child => {
            child.update()
        })
    }

    setDrawInfo(drawInfo: DrawInfo) {
        this.drawInfo = drawInfo
    }
}