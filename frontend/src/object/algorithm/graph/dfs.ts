import ArrayObject from "../../data-structure/array";
import DataStructureObject from "../../data-structure/dataStructure";
import { IGraphNodeObject, IGraphObject } from "../../data-structure/graph";
import HashMapObject, { strHash } from "../../data-structure/hashMap";
import { AlgorithmObject, DataStructureTracer } from "../algorithm";

export class DFSObject extends AlgorithmObject {

  constructor(id: string) {
    super(id, 'dfs', 'DFS')
  }
  override check(...inputs: DataStructureObject[]): boolean {
    return inputs.length === 1 && (inputs[0].type === 'ds-graph' || inputs[0].type === 'ds-tree')
  }

  override bind(...inputs: DataStructureObject[]): this {
    this.unbind()
    
    let graph = inputs[0] as unknown as IGraphObject<any, IGraphNodeObject<any>>
    let input = inputs[0] as DataStructureObject
    const tracer = new DataStructureTracer()
    const nodes = Array.from(graph.nodes)

    const init = input.copy().succeed(input)
    this.states.push({
      emitter: init,
      data: [init],
      operations: [],
      children: []
    })

    const result = new ArrayObject<any>(this.id + '-result')
    const isVisit = new HashMapObject<string, boolean>(this.id + '-isVisit', 5, strHash)

    tracer.begin({
      data: input,
      config: {
        recursive: true
      }
    }, {
      data: isVisit,
      config: {
        trace: false
      }
    }, result)
    const dfs = (node: IGraphNodeObject<any>) => {
      isVisit.set(node.lid, true)
      result.push(node.value)
      for (const successor of graph.getSuccessors(node.lid)) {
        if (isVisit.get(successor.lid)) {
          continue
        }
        dfs(successor)
      }
    }

    for (const node of nodes) {
      if (isVisit.get(node.lid)) {
        continue
      }
      dfs(node)
    }

    this.states.push(...tracer.end())
    return super.bind(...inputs)
  }
}