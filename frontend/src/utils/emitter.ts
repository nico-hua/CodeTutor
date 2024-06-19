export default class Emitter {
  private subscribers: Map<string | symbol, Set<Function>> = new Map()

  copy() {
    const copy = new Emitter()
    copy.subscribers = new Map()
    for (const [event, callbacks] of this.subscribers) {
      copy.subscribers.set(event, new Set(callbacks))
    }
    return copy
  }

  on(event: string | symbol, callback: Function) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event)?.add(callback)
    return this
  }

  once(event: string | symbol, callback: Function) {
    const wrapper = (...args: any[]) => {
      callback(...args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }

  off(event: string | symbol, callback: Function) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event)?.delete(callback)
    }
    return this
  }

  notify(event: string | symbol, ...args: any[]) {
    this.subscribers.get(event)?.forEach(callback => {
      callback(...args)
    })
    return this
  }
}