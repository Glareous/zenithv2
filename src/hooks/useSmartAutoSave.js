import { useCallback, useMemo, useState, useRef } from 'react'

export const useSmartAutoSave = () => {
  const [context, setContext] = useState({
    source: null, // 'user', 'system', 'drawer', 'canvas'
    type: null, // 'create', 'update', 'delete', 'move'
    importance: null, // 'critical', 'normal', 'low'
  })
  
  const lastTriggerRef = useRef(null)

  const shouldAutoSave = useMemo(() => {
    const shouldSave = (
      (context.source === 'user' || (context.source === 'system' && context.importance === 'critical')) &&
      context.type !== 'move' &&
      context.importance !== 'low' &&
      context.source !== null
    )
    
    // Si debería hacer auto-save y es diferente al último trigger, resetear después
    if (shouldSave && lastTriggerRef.current !== `${context.source}-${context.type}-${context.importance}`) {
      lastTriggerRef.current = `${context.source}-${context.type}-${context.importance}`
      // Reset context after this render cycle to prevent loops
      setTimeout(() => {
        setContext({
          source: null,
          type: null,
          importance: null,
        })
      }, 0)
    }
    
    return shouldSave
  }, [context])

  const triggerChange = useCallback((source, type, importance = 'normal') => {
    console.log(`⚡ Smart auto-save triggered:`, { source, type, importance })
    setContext({ source, type, importance })
  }, [])

  return { shouldAutoSave, triggerChange, context }
}