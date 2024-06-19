import DataStructureObject from '../../data-structure/dataStructure';
import GraphObject, {
  IGraphNodeObject,
  IGraphObject,
} from '../../data-structure/graph';
import HashMapObject, { strHash } from '../../data-structure/hashMap';
import { HeapObject } from '../../data-structure/heap';
import { AlgorithmObject, DataStructureTracer } from '../algorithm';

class DijkstraHeapItem<T> {
  constructor(public node: IGraphNodeObject<T>, public dist: number) {}

  valueOf() {
    return this.dist;
  }

  toString() {
    return JSON.stringify({ id: this.node.lid, dist: this.dist });
  }
}

export class DijkstraObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'dijkstra', 'Dijkstra');
  }

  override check(...inputs: any[]) {
    return inputs.length === 1 && inputs[0] instanceof GraphObject;
  }

  override bind(...inputs: DataStructureObject[]): this {
    this.unbind()

    const input = inputs[0] as DataStructureObject;
    const graph = input as unknown as IGraphObject<any, IGraphNodeObject<any>>;
    this.states = [];
    const init = input.copy().succeed(input);
    this.states.push({
      emitter: init,
      data: [init],
      operations: [],
      children: [],
    });

    const pq = new HeapObject<DijkstraHeapItem<any>>(this.id + '-pq');
    const distMap = new HashMapObject<string, number>(
      this.id + '-dist',
      5,
      strHash
    );

    let src: IGraphNodeObject<any> | null = null;
    for (const node of graph.nodes) {
      if (graph.getPredecessors(node).length === 0 && !src) {
        src = node;
      } else {
        distMap.set(node.lid, Infinity);
      }
    }

    const tracer = new DataStructureTracer();

    tracer.begin(
      input,
      { data: pq, config: { trace: true } },
      {
        data: distMap,
        config: { trace: false },
      }
    );

    if (src) {
      const node = src as unknown as DataStructureObject;
      pq.push(new DijkstraHeapItem(src, 0));
      distMap.set(src.lid, 0);

      this.states.push({
        emitter: init,
        data: [init, node.copy().succeed(node)],
        operations: [],
        children: [],
      });
    }

    while (pq.length > 0) {
      const { node, dist } = pq.pop();

      if (dist !== distMap.get(node.lid)) {
        continue;
      }

      for (const succ of graph.getSuccessors(node)) {
        const newDist = dist + graph.getWeight(node.lid, succ.lid);
        const oldDist = distMap.get(succ.lid)!;
        if (newDist < oldDist) {
          distMap.set(succ.lid, newDist);
          pq.push(new DijkstraHeapItem(succ, newDist));
        }
      }
    }

    this.states.push(...tracer.end());
    return super.bind(...inputs);
  }
}
