## 添加一个数据结构

1. 在**src/object/data-structure**中定义数据结构类，继承**DataStructureObject**，如在array.ts中
```ts
export class ArrayObject<T> extends DataStructureObject {
  ...
}
```

2. 在**app/repository/data-structure**中定义数据结构视图组件，实现**IDataStructureComponent**接口。需要实现**getSlots**方法，该方法返回所有需要连线的位置。如在array.component.ts中
```ts
export class ArrayComponent implements IDataStructureComponent {
  ...
  getSlots(): Slots {
    return {
      inputs: [],
      outputs: []
    }
  }
}
```

3. 在**src/app/repository/data-structure/data-structure-component.html**中注册，如
```html
...
<ng-template #graphBlock>
  <ng-container *ngIf="value.type === 'ds-graph'; else defaultBlock">
    <app-graph #objectRef [value]="graph" [readonly]="readonly"></app-graph>
  </ng-container>
</ng-template>
...
```
同时在**src/app/repository/data-structure/data-structure-component.ts**中定义get方法，如
```ts
get graph() {
  return this.value as GraphObject<any>
}
```
添加引用：
```ts
import { StackObject } from '../../../object/data-structure/stack';
import { StackComponent } from './stack/stack.component';
@Component({
  ...
  imports: [
    ......
    StackComponent,
  ],
  ...
})
```
4. 在**src/app/repository/**中注册，需要修改**items**，其中**id**与**type**对应，如
```ts
items: Record<string, TCanvasPanelItem[]> = {
  'ds': [
    ...
    {
      id: 'graph',
      name: '图',
    },
  ]
...
}
...
function createDataStructure(id: string, type: string): DataStructureObject {
  switch (type) {
    ...
    case 'graph':
      return new GraphObject(id, graph)
    ...
  }
}
```

## 添加一个算法

1. 在**src/object/algorithm**中定义算法类，继承**AlgorithmObject**，如在sort/merge.ts中
```ts
class MergeSortObject extends AlgorithmObject {
  ...
}
```
需要实现两个方法。
```ts
/**
  * 校验输入
  * @param inputs 
  * @returns 是否通过校验 
  */
check(...inputs: DataStructureObject[])
/**
  * 绑定输入数据结构，须在子类中实现
  * 子类中，每执行一步需复制所需数据以及对应的操作(options)保存为状态，添加到this.states中。可使用DataStructureTracer简化，如sort/merge.ts
  * @param inputs 
  * @returns this
  */
bind(...inputs: DataStructureObject[])
```
**注意：在子类的方法结束时需要调用父类方法**，如**/sort/merge.ts**中
```ts
override bind(...inputs: DataStructureObject[]) {
  ...
  // 边界
  if (array.length <= 1) {
    ...
    return super.bind(...inputs)
  }

  ...

  return super.bind(...inputs)
}  
```

2. 在**app/repository/algorithm**中定义算法视图组件，实现**IAlgorithmComponent**接口。需要实现**getSlots**方法，该方法返回所有需要连线的位置。如在sort/merge.component.ts中
```ts
export class MergeComponent implements IAlgorithmComponent {
  ...
}
```
需要实现两个方法
```ts
/**
 * 每次切换到某一步回调
 * @Params event: TStepEvent, 包括属性
 *  step: 当前步骤(0-index)
 *  emitter: 当前被操作的数据结构
 *  operations: 当前操作
 *  data: 当前所有的数据结构
 *  children: 如果算法是递归的，children是当前子算法的算法对象
 */
onStep({ step, emitter, operations, data, children }: TStepEvent) {
  ...
}

/**
 * 算法结束回调。一般用来重置变量
 * @Params event: TSubmitEvent, 包括属性
 *  data: 算法返回的数据结构;
 *  position: 提交的坐标;
 */
onSubmit(event: TSubmitEvent) {
  ...
}
```

3. 在**src/app/repository/algorithm/algorithm-component.html**中注册，如
```html
<ng-template #mergeSortBlock>
  <ng-container *ngIf="value.type === 'alg-merge-sort'; else defaultBlock">
    <app-merge #objectRef [value]="merge"></app-merge>
  </ng-container>
</ng-template>
```

4. 在**src/app/repository/algorithm/algorithm-component.ts**中定义get方法，如
```ts
get merge() {
  return this.value as MergeSortObject
}
```

5. 在**src/app/repository/repository-component**中注册，需要修改**items**，其中**id**与**type**对应，如
```ts
items: Record<string, TCanvasPanelItem[]> = {
  'alg': [
    ...
    {
      id: 'merge-sort',
      name: '归并排序',
    },
  ]
  ...
}

...

function createAlgorithm(id: string, type: string): AlgorithmObject {
  switch (type) {
    ...
    case 'merge-sort':
      return new MergeSortObject(id)
    ...
  }
}
```

## 算法执行过程动画
算法对象和数据结构对象通过事件订阅/发布绑定。定义数据结构时，须在操作函数中通过**notify**将操作发布给订阅者。其中一部分订阅者就是数据结构的视图组件，通过这些发布的消息执行动画。  
在数据结构组件中，定义好这些事件，并在对数据结构的某些操作中触发，如**array.ts**中
```ts
/**
 * 在算法的实现中，需要使用array.get(i)代替array[i]
 */
get(index: number) {
  const value = this.values[index];
  this.notify(ArrayObject.Event.GET, index, value);
  return value
}
```

在数据结构的视图组件中，需要提前订阅这些事件。如**array.component.ts**中
```ts
ngOnChanges(changes: SimpleChanges): void {
  if (changes['initArray']) {
    this.array = this.initArray
      .on(ArrayObject.Event.GET, this.onArrayGet_b)
      .on(ArrayObject.Event.UPDATE, this.onArrayUpdate_b)
      .on(ArrayObject.Event.ADD, this.onArrayAdd_b)
      .on(ArrayObject.Event.REMOVE, this.onArrayRemove_b)
      .on(ArrayObject.Event.SWAP, this.onArraySwap_b)

    ...
  }
}
```

在算法的视图组件中，需要将每一步提前计算出来的操作发布给订阅者。建议在数据结构组件的**change**回调中发布，这样可以确保视图已经更新。如**merge.component.ts**中
```ts
onChange() {
  this.emitter.begin() // 开启事件发布
  this.operations.forEach(({ event, args }) => {
    this.emitter?.notify(event, ...args)
  })
  this.emitter.end()  // 关闭
}
```
```html
<div class="merge">
  ...
    <app-array ... (change)="onChange($event)"></app-array>
  ...
</div>
```
