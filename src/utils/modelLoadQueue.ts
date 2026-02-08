/**
 * Queue that limits concurrent GLB model downloads.
 * Items wait in line and get a slot when one frees up.
 */
const MAX_CONCURRENT = 5

interface PendingEntry {
  onReady: () => void
  cancelled: boolean
}

let activeCount = 0
const queue: PendingEntry[] = []

function drainQueue() {
  while (queue.length > 0 && activeCount < MAX_CONCURRENT) {
    const entry = queue.shift()!
    if (entry.cancelled) continue
    activeCount++
    entry.onReady()
  }
}

/**
 * Request a slot to start loading a model.
 * Calls `onReady` immediately if a slot is available, otherwise queues.
 * Returns a cancel function (removes from queue if still pending).
 */
export function requestModelSlot(onReady: () => void): () => void {
  const entry: PendingEntry = { onReady, cancelled: false }

  if (activeCount < MAX_CONCURRENT) {
    activeCount++
    onReady()
  } else {
    queue.push(entry)
  }

  return () => {
    entry.cancelled = true
  }
}

/**
 * Release a loading slot after a model has finished loading.
 * This frees the slot for the next model in the queue.
 */
export function releaseModelSlot() {
  activeCount = Math.max(0, activeCount - 1)
  drainQueue()
}
