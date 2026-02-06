import { describe, it, expect, vi } from 'vitest'
import { EventBus, createEventBus } from './index'

interface TestEvents {
  'user.login': { userId: string }
  'user.logout': undefined
  'data.update': { id: number; value: string }
}

describe('EventBus', () => {
  it('should emit and receive events with payload', () => {
    const bus = new EventBus<TestEvents>()
    const handler = vi.fn()

    bus.on('user.login', handler)
    bus.emit('user.login', { userId: '123' })

    expect(handler).toHaveBeenCalledWith({ userId: '123' })
  })

  it('should emit events without payload', () => {
    const bus = new EventBus<TestEvents>()
    const handler = vi.fn()

    bus.on('user.logout', handler)
    bus.emit('user.logout')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should support multiple handlers for same event', () => {
    const bus = new EventBus<TestEvents>()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    bus.on('user.login', handler1)
    bus.on('user.login', handler2)
    bus.emit('user.login', { userId: '456' })

    expect(handler1).toHaveBeenCalledWith({ userId: '456' })
    expect(handler2).toHaveBeenCalledWith({ userId: '456' })
  })

  it('should unsubscribe with off()', () => {
    const bus = new EventBus<TestEvents>()
    const handler = vi.fn()

    bus.on('user.login', handler)
    bus.off('user.login', handler)
    bus.emit('user.login', { userId: '789' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('should unsubscribe with returned function', () => {
    const bus = new EventBus<TestEvents>()
    const handler = vi.fn()

    const unsubscribe = bus.on('user.login', handler)
    unsubscribe()
    bus.emit('user.login', { userId: '789' })

    expect(handler).not.toHaveBeenCalled()
  })

  it('should support once() for single emission', () => {
    const bus = new EventBus<TestEvents>()
    const handler = vi.fn()

    bus.once('user.login', handler)
    bus.emit('user.login', { userId: '1' })
    bus.emit('user.login', { userId: '2' })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ userId: '1' })
  })

  it('should clear specific event listeners', () => {
    const bus = new EventBus<TestEvents>()
    const loginHandler = vi.fn()
    const logoutHandler = vi.fn()

    bus.on('user.login', loginHandler)
    bus.on('user.logout', logoutHandler)
    bus.clear('user.login')

    bus.emit('user.login', { userId: '1' })
    bus.emit('user.logout')

    expect(loginHandler).not.toHaveBeenCalled()
    expect(logoutHandler).toHaveBeenCalled()
  })

  it('should clear all listeners', () => {
    const bus = new EventBus<TestEvents>()
    const loginHandler = vi.fn()
    const logoutHandler = vi.fn()

    bus.on('user.login', loginHandler)
    bus.on('user.logout', logoutHandler)
    bus.clear()

    bus.emit('user.login', { userId: '1' })
    bus.emit('user.logout')

    expect(loginHandler).not.toHaveBeenCalled()
    expect(logoutHandler).not.toHaveBeenCalled()
  })

  it('should return correct listener count', () => {
    const bus = new EventBus<TestEvents>()

    expect(bus.listenerCount('user.login')).toBe(0)

    const unsub1 = bus.on('user.login', () => {})
    expect(bus.listenerCount('user.login')).toBe(1)

    bus.on('user.login', () => {})
    expect(bus.listenerCount('user.login')).toBe(2)

    unsub1()
    expect(bus.listenerCount('user.login')).toBe(1)
  })

  it('should handle emit when no listeners exist', () => {
    const bus = new EventBus<TestEvents>()
    // Should not throw
    expect(() => bus.emit('user.login', { userId: '1' })).not.toThrow()
  })

  it('should handle off when no listeners exist', () => {
    const bus = new EventBus<TestEvents>()
    // Should not throw
    expect(() => bus.off('user.login', () => {})).not.toThrow()
  })
})

describe('createEventBus', () => {
  it('should create a working EventBus instance', () => {
    const bus = createEventBus<TestEvents>()
    const handler = vi.fn()

    bus.on('data.update', handler)
    bus.emit('data.update', { id: 1, value: 'test' })

    expect(handler).toHaveBeenCalledWith({ id: 1, value: 'test' })
  })
})
