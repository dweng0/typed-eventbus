# typed-eventbus

A simple, strongly-typed event bus for TypeScript applications.

## Installation

```bash
npm install typed-eventbus
```

## Usage

### Define Your Events

Create an interface that maps event names to their payload types:

```ts
interface MyEvents {
  'user.login': { userId: string; timestamp: number }
  'user.logout': undefined  // No payload
  'notification.show': { message: string; type: 'info' | 'error' }
}
```

### Create an Event Bus

```ts
import { EventBus } from 'typed-eventbus'

const eventBus = new EventBus<MyEvents>()
```

Or use the factory function:

```ts
import { createEventBus } from 'typed-eventbus'

const eventBus = createEventBus<MyEvents>()
```

### Subscribe to Events

```ts
// Subscribe with automatic type inference
eventBus.on('user.login', (payload) => {
  console.log(`User ${payload.userId} logged in at ${payload.timestamp}`)
})

// Returns an unsubscribe function
const unsubscribe = eventBus.on('notification.show', (payload) => {
  showNotification(payload.message, payload.type)
})

// Later, unsubscribe
unsubscribe()
```

### Emit Events

```ts
// Emit with typed payload
eventBus.emit('user.login', { userId: '123', timestamp: Date.now() })

// Events with undefined payload don't require arguments
eventBus.emit('user.logout')
```

### One-time Subscription

```ts
// Handler is automatically removed after first emission
eventBus.once('user.login', (payload) => {
  console.log('First login detected!')
})
```

### Manual Unsubscribe

```ts
const handler = (payload: MyEvents['user.login']) => {
  console.log(payload)
}

eventBus.on('user.login', handler)
eventBus.off('user.login', handler)
```

### Clear Listeners

```ts
// Clear all listeners for a specific event
eventBus.clear('user.login')

// Clear all listeners for all events
eventBus.clear()
```

### Check Listener Count

```ts
const count = eventBus.listenerCount('user.login')
console.log(`${count} listeners registered`)
```

## API

### `EventBus<Events>`

The main class for creating typed event buses.

#### Methods

| Method | Description |
|--------|-------------|
| `on(event, callback)` | Subscribe to an event. Returns unsubscribe function. |
| `off(event, callback)` | Unsubscribe a specific handler from an event. |
| `emit(event, payload?)` | Emit an event with optional payload. |
| `once(event, callback)` | Subscribe for a single emission only. |
| `clear(event?)` | Remove listeners for an event, or all events. |
| `listenerCount(event)` | Get the number of listeners for an event. |

### `createEventBus<Events>()`

Factory function to create a new EventBus instance.

### `EventHandler<T>`

Type alias for event handler functions: `(payload: T) => void`

## License

MIT
