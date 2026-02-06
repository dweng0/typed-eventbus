/**
 * Handler function type for event callbacks
 */
export type EventHandler<T> = (payload: T) => void

/**
 * A strongly-typed event bus for managing app-wide communication.
 *
 * @typeParam Events - A record type mapping event names to their payload types
 *
 * @example
 * ```ts
 * // Define your events
 * interface MyEvents {
 *   'user.login': { userId: string; timestamp: number }
 *   'user.logout': undefined
 *   'notification.show': { message: string; type: 'info' | 'error' }
 * }
 *
 * // Create an event bus instance
 * const eventBus = new EventBus<MyEvents>()
 *
 * // Subscribe to events
 * eventBus.on('user.login', (payload) => {
 *   console.log(`User ${payload.userId} logged in`)
 * })
 *
 * // Emit events
 * eventBus.emit('user.login', { userId: '123', timestamp: Date.now() })
 * eventBus.emit('user.logout') // No payload needed
 * ```
 */
export class EventBus<Events extends Record<string, any>> {
  private events: { [K in keyof Events]?: EventHandler<Events[K]>[] } = {}

  /**
   * Subscribe to an event
   *
   * @param event - The event name to subscribe to
   * @param callback - The handler function to call when the event is emitted
   * @returns A function to unsubscribe from the event
   */
  on = <K extends keyof Events>(
    event: K,
    callback: EventHandler<Events[K]>
  ): (() => void) => {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]!.push(callback)

    // Return unsubscribe function
    return () => this.off(event, callback)
  }

  /**
   * Unsubscribe from an event
   *
   * @param event - The event name to unsubscribe from
   * @param callback - The handler function to remove
   */
  off = <K extends keyof Events>(
    event: K,
    callback: EventHandler<Events[K]>
  ): void => {
    if (!this.events[event]) return
    this.events[event] = this.events[event]!.filter((cb) => cb !== callback)
  }

  /**
   * Emit an event with an optional payload
   *
   * @param event - The event name to emit
   * @param args - The payload to pass to handlers (required if event payload type is not undefined)
   */
  emit = <K extends keyof Events>(
    event: K,
    ...args: Events[K] extends undefined ? [] : [payload: Events[K]]
  ): void => {
    if (!this.events[event]) return
    this.events[event]!.forEach((callback) => {
      // @ts-expect-error - TS can't infer tuple spreads correctly
      callback(...args)
    })
  }

  /**
   * Subscribe to an event for a single emission only
   *
   * @param event - The event name to subscribe to
   * @param callback - The handler function to call once
   * @returns A function to unsubscribe before the event fires
   */
  once = <K extends keyof Events>(
    event: K,
    callback: EventHandler<Events[K]>
  ): (() => void) => {
    const wrapper: EventHandler<Events[K]> = (payload) => {
      this.off(event, wrapper)
      callback(payload)
    }
    return this.on(event, wrapper)
  }

  /**
   * Remove all listeners for a specific event, or all events if no event is specified
   *
   * @param event - Optional event name. If omitted, clears all events.
   */
  clear = <K extends keyof Events>(event?: K): void => {
    if (event) {
      delete this.events[event]
    } else {
      this.events = {}
    }
  }

  /**
   * Get the number of listeners for a specific event
   *
   * @param event - The event name to check
   * @returns The number of listeners
   */
  listenerCount = <K extends keyof Events>(event: K): number => {
    return this.events[event]?.length ?? 0
  }
}

/**
 * Create a new EventBus instance
 *
 * @typeParam Events - A record type mapping event names to their payload types
 * @returns A new EventBus instance
 */
export function createEventBus<Events extends Record<string, any>>(): EventBus<Events> {
  return new EventBus<Events>()
}

export default EventBus
