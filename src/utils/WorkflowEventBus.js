class WorkflowEventBus {
  static emit(event, data) {
    console.log(`=🚀 Event emitted: workflow:${event}`, data)
    window.dispatchEvent(new CustomEvent(`workflow:${event}`, { detail: data }))
  }

  static on(event, handler) {
    window.addEventListener(`workflow:${event}`, handler)
  }

  static off(event, handler) {
    window.removeEventListener(`workflow:${event}`, handler)
  }
}

export default WorkflowEventBus