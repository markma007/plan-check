const fs = require('fs');

const key_value_line_parse = (line) => {
    let [name, value] = line.split("=")
    name=name.trim().replace(/\s/g,"_").replace(/\./g,"")
    try {
        value=value.replace(/"/g,"").replace(";","").trim()
    } catch {
        // console.log('==>', line)
    }
    
    return [name, value]
}

class P3Laser {
    static current = null
    static instances = []
    constructor () {
        P3Laser.current = this
        P3Laser.instances.push(this)
        this.id=P3Laser.instances.length-1
        this.parent = -1
        this.parentType = undefined
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
}

class P3LaserCenter {
    static current = null
    static instances = []
    constructor () {
        P3LaserCenter.current = this
        P3LaserCenter.instances.push(this)
        this.id=P3LaserCenter.instances.length-1
        this.parent = P3Laser.current.id
        this.parentType = "P3Laser"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name==='XCoord') value=parseFloat(value)
            if (name==='YCoord') value=parseFloat(value)
            if (name==='ZCoord') value=parseFloat(value)
            if (name==='XRotation') value=parseFloat(value)
            if (name==='YRotation') value=parseFloat(value)
            if (name==='ZRotation') value=parseFloat(value)
            if (name==='Radius') value=parseFloat(value)
            this[name] = value
        }
    }
}

class P3Poi {
    static current = null
    static instances = []
    static dict = {}
    static register (name, poi) {
        P3Poi.dict[name] = poi
    }
    static GetPoiByName (name) {
        // return P3Poi.dict[name]
        let filtered = P3Poi.instances.filter((poi)=>poi.Name===name)
        if (filtered.length===0) {
            return null
        } else {
            return filtered[0]
        }
    }
    constructor () {
        P3Poi.current = this
        P3Poi.instances.push(this)
        this.id=P3Poi.instances.length-1
        this.parent = -1
        this.parentType = undefined
    }
    get IsISO () {
        return this.Name.toUpperCase().includes('ISO')
    }
    get IsSetup () {
        return this.Name.toUpperCase().includes('SETUP')
    }
    get IsMarkerType () {
        return this.PoiInterpretedType === 'MARKER'
    }
    get IsISOType () {
        return this.PoiInterpretedType === 'ISOCENTER'
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name==='XCoord') value=parseFloat(value)
            if (name==='YCoord') value=parseFloat(value)
            if (name==='ZCoord') value=parseFloat(value)
            if (name==='XRotation') value=parseFloat(value)
            if (name==='YRotation') value=parseFloat(value)
            if (name==='ZRotation') value=parseFloat(value)
            if (name==='Radius') value=parseFloat(value)
            this[name] = value
            if (name === 'Name') {
                P3Poi.register(name, this)
            }
        }
    }
}

class P3PtSetup {
    static current = null
    static instances = []
    constructor () {
        P3PtSetup.current = this
        P3PtSetup.instances.push(this)
        this.id=P3PtSetup.instances.length-1
        this.parent = -1
        this.parentType = undefined
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
    get PatientPosition () {
        const map = {
            'On back (supine)': ['SUPINE','S'],
            'On front (prone)': ['PRONE','P']
        }
        return map[this.Position]
    }
    get PatientOrientation () {
        const map = {
            'Head First Into Scanner': ['HFS','HF'],
            'Feet First Into Scanner': ['FFS','FF']
        }
        return map[this.Orientation]
    }
}

class P3PlanInfo {
    static current = null
    static instances = []
    constructor () {
        P3PlanInfo.current = this
        P3PlanInfo.instances.push(this)
        this.id=P3PlanInfo.instances.length-1
        this.parent = -1
        this.parentType = undefined
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name==='RoiRevision') { value=parseInt(value) }
            if (name==='PoiRevision') { value=parseInt(value) }
            if (name==='DoseRevision') { value=parseInt(value) }
            this[name] = value
        }
    }
}

class P3PlanRev {
    static current = null
    static instances = []
    constructor () {
        P3PlanRev.current = this
        P3PlanRev.instances.push(this)
        this.id=P3PlanRev.instances.length-1
        this.parent = -1
        this.parentType = undefined
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
}

let HandledDict = {
    P3Laser, 
    P3LaserCenter,
    P3Poi,
    P3PtSetup,
    P3PlanInfo,
    P3PlanRev
}

const P3Read = (filename, fix) => {
        const data = fs.readFileSync(filename, 'UTF-8')
        let Lines = data.split(/\r?\n/)
        if (fix) {
            Lines.unshift(fix+' ={')
            Lines.push('};')
        }
        let NodeStack = []
        let NameStack = []
        let bracketDepth = 0
        Lines.forEach((line, index, lines) => {
            let __line=line.trim()
            if (__line==="") return
            /**
             * 
             */
            if (__line.endsWith("={")) {
                bracketDepth += 1
                let node = __line.split(" ")[0]
                let name = 'P3'+node
                if (HandledDict.hasOwnProperty(name)) {
                    new HandledDict[name]()
                    NodeStack.push({node, depth:bracketDepth})
                }
                NameStack.push(node)
            }
            /**
             * 
             */
            else if (__line.endsWith("};")) {
                let topNode = NodeStack[NodeStack.length-1]
                if (bracketDepth===topNode.depth) {
                    NodeStack.pop()
                }
                NameStack.pop()
                bracketDepth -= 1
            }
            /**
             * 
             */
            else {
                let topNode = NodeStack[NodeStack.length-1]
                // console.log(topNode) // {node, depth}
                if (topNode) { // topNode is undefined for top-level lines
                    let Klass = HandledDict['P3' + topNode.node]
                    if (bracketDepth>=topNode.depth) {
                        Klass.current.digest(__line, bracketDepth, Klass, topNode, index, lines, NameStack, NodeStack)
                    }
                }
                else {
                    // console.log('Top level >', index, __line)
                }
            }
        })
}

function dump () {
    let keys = Object.keys(HandledDict)
    keys.forEach(function (key, index) {
        let Klass = HandledDict[key]
        console.log(key, Klass.instances)
    })
}

const ReadLaser = (Paths) => {
    P3Read(Paths.Laser, 'Laser')
}

const ReadPoi = (Paths) => {
    P3Read(Paths.Points)
}

const ReadPtSetup = (Paths) => {
    P3Read(Paths.PatientSetup, 'PtSetup')
}

const ReadPlanInfo = (Paths) => {
    P3Read(Paths.PlanInfo, 'PlanInfo')
}

const ReadPlanRev = (Paths) => {
    P3Read(Paths.PlanRev, 'PlanRev')
}

const ReadALLMisc = (Paths) => {
    ReadLaser(Paths)
    ReadPoi(Paths)
    ReadPtSetup(Paths)
    ReadPlanInfo(Paths)
    ReadPlanRev(Paths)
}

module.exports = {
    ReadALLMisc,
    P3Laser, P3LaserCenter,
    P3Poi,
    P3PtSetup,
    P3PlanInfo,
    P3PlanRev
}


/**
 * LAser, Points, 
 */

// 

// console.log(P3Laser.current, P3LaserCenter.current)
// console.log(P3Poi.instances)
// console.log(P3PtSetup.current)
// console.log(P3PlanInfo.current)
// console.log(P3PlanRev.current)
