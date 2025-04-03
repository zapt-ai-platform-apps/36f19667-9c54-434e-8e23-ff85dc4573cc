/**
 * Simple event bus implementation for cross-module communication
 */
export class EventBus {
  subscribers = {};

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to be called when event is published
   * @returns {Function} - Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {any} data - Data to be passed to subscribers
   */
  publish(event, data) {
    console.log(`Event published: ${event}`, data);
    if (!this.subscribers[event]) return;
    this.subscribers[event].forEach(callback => callback(data));
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to unsubscribe
   */
  unsubscribe(event, callback) {
    if (!this.subscribers[event]) return;
    this.subscribers[event] = this.subscribers[event]
      .filter(cb => cb !== callback);
  }
}

export const eventBus = new EventBus();