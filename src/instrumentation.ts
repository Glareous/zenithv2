export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on server-side
    const { initializeAgenda, stopAgenda } = await import('@/server/services/agenda')

    // Initialize Agenda
    await initializeAgenda()

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...')
      await stopAgenda()
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...')
      await stopAgenda()
      process.exit(0)
    })
  }
}
