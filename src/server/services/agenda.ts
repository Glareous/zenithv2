import Agenda, { Job } from 'agenda'

import { db } from '@/server/db'
import { env } from '@/env'

// Create Agenda instance
export const agenda = new Agenda({
  db: { address: env.DATABASE_URL, collection: 'agendaJobs' },
  processEvery: '30 seconds', // Check for jobs every 30 seconds
  maxConcurrency: 20,
})

interface CronJobData {
  agentId: string
  triggerId: string
  cronExpression: string
  timezone: string
}

// Define job types
agenda.define('execute-agent-cron', async (job: Job<CronJobData>) => {
  const { agentId, triggerId, cronExpression, timezone } = job.attrs.data

  const startTime = Date.now()

  try {
    console.log(`🚀 CRON_JOB executing for agent: ${agentId}`)

    // 1. Verificar que el agente y el trigger estén activos
    const agent = await db.projectAgent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    })

    const trigger = await db.projectAgentTrigger.findUnique({
      where: { id: triggerId },
      select: {
        id: true,
        isActive: true,
      },
    })

    // Si el agente o el trigger están desactivados, skip
    if (!agent || !agent.isActive || !trigger || !trigger.isActive) {
      console.log(`⏭️  Skipping execution - Agent or trigger is inactive`)

      // Guardar log como SKIPPED
      await db.agentCronExecutionLog.create({
        data: {
          agentId,
          triggerId,
          triggerType: 'CRON_JOB',
          status: 'SKIPPED',
          scheduledAt: new Date(),
          executedAt: new Date(),
          duration: Date.now() - startTime,
          cronExpression,
          timezone,
          errorMessage: 'Agent or trigger is inactive',
        },
      })

      return
    }

    // 2. Por ahora, solo logueamos que se ejecutó (futuro: ejecutar el agente real)
    console.log(`✅ Agent "${agent.name}" (${agentId}) activated by CRON_JOB`)
    console.log(`📅 Cron: ${cronExpression} (${timezone})`)

    // TODO: Aquí iría la lógica real para ejecutar el agente
    // Por ahora solo registramos la ejecución exitosa

    // 3. Guardar log como SUCCESS
    await db.agentCronExecutionLog.create({
      data: {
        agentId,
        triggerId,
        triggerType: 'CRON_JOB',
        status: 'SUCCESS',
        scheduledAt: new Date(),
        executedAt: new Date(),
        duration: Date.now() - startTime,
        cronExpression,
        timezone,
      },
    })

    console.log(`✅ CRON_JOB completed successfully in ${Date.now() - startTime}ms`)
  } catch (error) {
    console.error(`❌ CRON_JOB failed for agent ${agentId}:`, error)

    // Guardar log como FAILED
    await db.agentCronExecutionLog.create({
      data: {
        agentId,
        triggerId,
        triggerType: 'CRON_JOB',
        status: 'FAILED',
        scheduledAt: new Date(),
        executedAt: new Date(),
        duration: Date.now() - startTime,
        cronExpression,
        timezone,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
})

// Function to schedule a CRON job for an agent
export async function scheduleAgentCronJob(
  agentId: string,
  triggerId: string,
  cronExpression: string,
  timezone: string
) {
  const jobName = `agent-cron-${triggerId}`

  // Cancel existing job if it exists
  await agenda.cancel({ name: jobName })

  // Schedule new job
  const job = agenda.create('execute-agent-cron', {
    agentId,
    triggerId,
    cronExpression,
    timezone,
  })

  job.repeatEvery(cronExpression, {
    timezone,
  })

  job.unique({ triggerId })
  await job.save()

  console.log(`📅 Scheduled CRON job: ${cronExpression} (${timezone}) for agent ${agentId}`)
}

// Function to cancel a CRON job
export async function cancelAgentCronJob(triggerId: string) {
  await agenda.cancel({ 'data.triggerId': triggerId })
  console.log(`🗑️  Cancelled CRON job for trigger ${triggerId}`)
}

// Function to load all active CRON jobs from database
export async function loadAllCronJobs() {
  console.log('📚 Loading all active CRON jobs from database...')

  const cronTriggers = await db.projectAgentTrigger.findMany({
    where: {
      type: 'CRON_JOB',
      isActive: true,
      cronExpression: { not: null },
    },
    include: {
      agentActions: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
        },
      },
    },
  })

  let scheduled = 0
  let skipped = 0

  for (const trigger of cronTriggers) {
    // Only schedule if agent is also active
    if (trigger.agentActions.agent.isActive) {
      await scheduleAgentCronJob(
        trigger.agentActions.agentId,
        trigger.id,
        trigger.cronExpression!,
        trigger.cronTimezone || 'UTC'
      )
      scheduled++
    } else {
      console.log(`⏭️  Skipping inactive agent: ${trigger.agentActions.agent.name}`)
      skipped++
    }
  }

  console.log(`✅ Loaded ${scheduled} CRON jobs (${skipped} skipped due to inactive agents)`)
}

// Initialize Agenda
export async function initializeAgenda() {
  try {
    console.log('🚀 Initializing Agenda...')

    // Start Agenda
    await agenda.start()

    // Load all CRON jobs
    await loadAllCronJobs()

    console.log('✅ Agenda initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Agenda:', error)
    throw error
  }
}

// Graceful shutdown
export async function stopAgenda() {
  console.log('🛑 Stopping Agenda...')
  await agenda.stop()
  console.log('✅ Agenda stopped')
}
