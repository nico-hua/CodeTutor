import ArrayObject from '../data-structure/array';
import DataStructureObject from '../data-structure/dataStructure';
import { HeapObject } from '../data-structure/heap';
import { TreeNodeObject, TreeObject } from '../data-structure/tree';
import { AlgorithmObject, DataStructureTracer } from './algorithm';

export class BuildHeapObject extends AlgorithmObject {
  constructor(id: string) {
    super(id, 'build-heap', '建堆');
  }

  override check(...inputs: any[]) {
    return inputs.length === 1 && inputs[0] instanceof ArrayObject;
  }

  override bind(...inputs: DataStructureObject[]) {
    this.unbind();

    const array = inputs[0] as ArrayObject<any>;

    const init = array.copy().succeed(array);
    this.states.push({
      emitter: init,
      data: [init],
      operations: [],
      children: [],
    });

    const tree = new TreeObject(this.id + '-tree', 2);
    const nodes: TreeNodeObject<any>[] = new Array(array.length);
    const parent = (i: number) => Math.floor((i - 1) / 2);
    const compare = (i: number, j: number) => {
      array.compare(i, j);
      const node1 = nodes[i];
      const node2 = nodes[j];
      return tree.compare(node1, node2);
    };
    const swap = (i: number, j: number) => {
      const node1 = nodes[i];
      const node2 = nodes[j];
      tree.swap(node1, node2);
      const tmp = nodes[i];
      nodes[i] = nodes[j];
      nodes[j] = tmp;
      array.swap(i, j);
    };
    const heapify = (index: number) => {
      nodes[index].value  // getter
      const l = 2 * (index + 1) - 1;
      const r = 2 * (index + 1);
      let minIndex = index;
      if (l < array.length && compare(l, index)) {
        minIndex = l;
      }
      if (r < array.length && compare(r, minIndex)) {
        minIndex = r;
      }
      if (minIndex !== index) {
        swap(index, minIndex);
        heapify(minIndex);
      }
    };

    for (let i = 0; i < array.length; i++) {
      const parentNode = nodes[parent(i)];
      const node = new TreeNodeObject(
        this.id + '-node' + i,
        array.get(i),
        tree
      );
      tree.insert(node, parentNode);
      nodes[i] = node;
    }

    const tracer = new DataStructureTracer();
    tracer.begin({ data: array, config: { trace: false } }, tree);

    for (let i = Math.floor((array.length - 1) / 2); i >= 0; i--) {
      heapify(i);
    }

    this.states.push(...tracer.end());

    const heap = new HeapObject<any>(this.id + '-heap');
    heap.tree = tree.copy().succeed(tree);
    heap.data = array.copy().succeed(array)
    for (const node of heap.tree.nodes) {
      heap.nodeMap.set(nodes.findIndex(n => n.lid === node.lid), node)
    }
    
    this.states.push({
      emitter: heap,
      data: [array.copy().succeed(array), heap],
      operations: [],
      children: [],
    })

    return super.bind(...inputs);
  }
}
