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

## Step-by-Step Examples

### Complete Setup Example

```typescript
// 1. Define your event types
interface AppEvents {
  'user:login': { userId: string; email: string }
  'user:logout': undefined
  'cart:add': { productId: string; quantity: number }
  'cart:clear': undefined
  'notification': { message: string; type: 'success' | 'error' | 'info' }
}

// 2. Create a shared event bus instance (e.g., in eventBus.ts)
import { createEventBus } from 'typed-eventbus'

export const eventBus = createEventBus<AppEvents>()

// 3. Subscribe to events using "on"
const unsubscribe = eventBus.on('user:login', (payload) => {
  console.log(`Welcome ${payload.email}!`)
})

// 4. Emit events from anywhere in your app
eventBus.emit('user:login', { userId: '123', email: 'user@example.com' })

// 5. Unsubscribe when no longer needed using the returned function
unsubscribe()

// Or use "off" with the same handler reference
const handleLogout = () => {
  console.log('User logged out')
}
eventBus.on('user:logout', handleLogout)
eventBus.off('user:logout', handleLogout)
```

### React Example

```typescript
// eventBus.ts
import { createEventBus } from 'typed-eventbus'

interface AppEvents {
  'theme:change': { mode: 'light' | 'dark' }
  'user:login': { userId: string; name: string }
  'notification': { message: string }
}

export const eventBus = createEventBus<AppEvents>()
```

```typescript
// ThemeToggle.tsx - Emitting events
import { eventBus } from './eventBus'

export function ThemeToggle() {
  const toggleTheme = (mode: 'light' | 'dark') => {
    eventBus.emit('theme:change', { mode })
  }

  return (
    <button onClick={() => toggleTheme('dark')}>
      Switch to Dark Mode
    </button>
  )
}
```

```typescript
// App.tsx - Subscribing to events
import { useEffect, useState } from 'react'
import { eventBus } from './eventBus'

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Subscribe when component mounts
    const unsubscribe = eventBus.on('theme:change', (payload) => {
      setTheme(payload.mode)
    })

    // Unsubscribe when component unmounts
    return () => unsubscribe()
  }, [])

  return <div className={theme}>My App</div>
}
```

```typescript
// Custom hook for reusable event subscriptions
import { useEffect } from 'react'
import { eventBus } from './eventBus'
import type { AppEvents } from './eventBus'

export function useEventBus<K extends keyof AppEvents>(
  event: K,
  handler: (payload: AppEvents[K]) => void
) {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, handler)
    return () => unsubscribe()
  }, [event, handler])
}

// Usage in a component
function NotificationToast() {
  const [message, setMessage] = useState('')

  useEventBus('notification', (payload) => {
    setMessage(payload.message)
  })

  return message ? <div className="toast">{message}</div> : null
}
```

### Vue.js Example

```typescript
// eventBus.ts
import { createEventBus } from 'typed-eventbus'

interface AppEvents {
  'modal:open': { title: string; content: string }
  'modal:close': undefined
  'cart:update': { itemCount: number }
}

export const eventBus = createEventBus<AppEvents>()
```

```vue
<!-- ModalTrigger.vue - Emitting events -->
<script setup lang="ts">
import { eventBus } from './eventBus'

function openModal() {
  eventBus.emit('modal:open', {
    title: 'Confirm Action',
    content: 'Are you sure you want to proceed?'
  })
}
</script>

<template>
  <button @click="openModal">Open Modal</button>
</template>
```

```vue
<!-- Modal.vue - Subscribing to events -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { eventBus } from './eventBus'

const isOpen = ref(false)
const title = ref('')
const content = ref('')

// Store unsubscribe functions
let unsubscribeOpen: (() => void) | null = null
let unsubscribeClose: (() => void) | null = null

onMounted(() => {
  // Subscribe when component mounts
  unsubscribeOpen = eventBus.on('modal:open', (payload) => {
    title.value = payload.title
    content.value = payload.content
    isOpen.value = true
  })

  unsubscribeClose = eventBus.on('modal:close', () => {
    isOpen.value = false
  })
})

onUnmounted(() => {
  // Unsubscribe when component unmounts
  unsubscribeOpen?.()
  unsubscribeClose?.()
})

function close() {
  eventBus.emit('modal:close')
}
</script>

<template>
  <div v-if="isOpen" class="modal">
    <h2>{{ title }}</h2>
    <p>{{ content }}</p>
    <button @click="close">Close</button>
  </div>
</template>
```

```typescript
// Composable for reusable event subscriptions
import { onMounted, onUnmounted } from 'vue'
import { eventBus } from './eventBus'
import type { AppEvents } from './eventBus'

export function useEventBus<K extends keyof AppEvents>(
  event: K,
  handler: (payload: AppEvents[K]) => void
) {
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = eventBus.on(event, handler)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })
}

// Usage in a component
// useEventBus('cart:update', (payload) => {
//   cartCount.value = payload.itemCount
// })
```

### SolidJS Example

```typescript
// eventBus.ts
import { createEventBus } from 'typed-eventbus'

interface AppEvents {
  'auth:login': { token: string; user: { id: string; name: string } }
  'auth:logout': undefined
  'data:refresh': { source: string }
}

export const eventBus = createEventBus<AppEvents>()
```

```typescript
// LoginButton.tsx - Emitting events
import { eventBus } from './eventBus'

export function LoginButton() {
  const handleLogin = async () => {
    // Simulate login
    const response = { token: 'abc123', user: { id: '1', name: 'John' } }

    eventBus.emit('auth:login', response)
  }

  return <button onClick={handleLogin}>Login</button>
}
```

```typescript
// UserProfile.tsx - Subscribing to events
import { createSignal, onMount, onCleanup } from 'solid-js'
import { eventBus } from './eventBus'

export function UserProfile() {
  const [user, setUser] = createSignal<{ id: string; name: string } | null>(null)

  onMount(() => {
    // Subscribe when component mounts
    const unsubscribeLogin = eventBus.on('auth:login', (payload) => {
      setUser(payload.user)
    })

    const unsubscribeLogout = eventBus.on('auth:logout', () => {
      setUser(null)
    })

    // Unsubscribe when component unmounts
    onCleanup(() => {
      unsubscribeLogin()
      unsubscribeLogout()
    })
  })

  return (
    <div>
      {user() ? (
        <span>Welcome, {user()!.name}!</span>
      ) : (
        <span>Please log in</span>
      )}
    </div>
  )
}
```

```typescript
// Primitive for reusable event subscriptions
import { onMount, onCleanup } from 'solid-js'
import { eventBus } from './eventBus'
import type { AppEvents } from './eventBus'

export function useEventBus<K extends keyof AppEvents>(
  event: K,
  handler: (payload: AppEvents[K]) => void
) {
  onMount(() => {
    const unsubscribe = eventBus.on(event, handler)
    onCleanup(() => unsubscribe())
  })
}

// Usage in a component
// useEventBus('data:refresh', (payload) => {
//   console.log(`Refreshing data from ${payload.source}`)
//   refetch()
// })
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
