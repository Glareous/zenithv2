import { apiKeysRouter } from '@src/server/api/routers/apiKeys'
import { authRouter } from '@src/server/api/routers/auth'
import { projectRouter } from '@src/server/api/routers/project'
import { projectAgentRouter } from '@src/server/api/routers/projectAgent'
import { projectAgentFileRouter } from '@src/server/api/routers/projectAgentFile'
import { projectContactRouter } from '@src/server/api/routers/projectContact'
import { projectContactFileRouter } from '@src/server/api/routers/projectContactFile'
import { projectCustomerRouter } from '@src/server/api/routers/projectCustomer'
import { projectCustomerFileRouter } from '@src/server/api/routers/projectCustomerFile'
import { projectDealRouter } from '@src/server/api/routers/projectDeal'
import { projectDealMessageRouter } from '@src/server/api/routers/projectDealMessage'
import { projectFaqRouter } from '@src/server/api/routers/projectFaq'
import { projectFileRouter } from '@src/server/api/routers/projectFile'
import { projectIntegrationRouter } from '@src/server/api/routers/projectIntegration'
import { projectLeadRouter } from '@src/server/api/routers/projectLead'
import { projectLeadFileRouter } from '@src/server/api/routers/projectLeadFile'
import { projectMemberRouter } from '@src/server/api/routers/projectMember'
import { projectOrdersRouter } from '@src/server/api/routers/projectOrders'
import { projectOrdersItemsRouter } from '@src/server/api/routers/projectOrdersItems'
import { projectOrdersServicesRouter } from '@src/server/api/routers/projectOrdersServices'
import { projectProductRouter } from '@src/server/api/routers/projectProduct'
import { projectCategoryRouter } from '@src/server/api/routers/projectCategory'
import { projectServiceRouter } from '@src/server/api/routers/projectService'
import { projectProductFileRouter } from '@src/server/api/routers/projectProductFile'
import { projectServiceFileRouter } from '@src/server/api/routers/projectServiceFile'
import { projectProductStockMovementRouter } from '@src/server/api/routers/projectProductStockMovemen'
import { projectProductWarehouseRouter } from '@src/server/api/routers/projectProductWarehouse'
import { createCallerFactory, createTRPCRouter } from '@src/server/api/trpc'

import { projectActionRouter } from './routers/projectAction'
import { projectAgentActionsRouter } from './routers/projectAgentActions'
import { projectAgentTriggerRouter } from './routers/projectAgentTrigger'
import { projectAgentWorkflowRouter } from './routers/projectAgentWorkflow'
import { phoneNumberRouter } from './routers/phoneNumber'
import { projectPhoneNumberRouter } from './routers/projectPhoneNumber'
import { projectEmployeeRouter } from './routers/projectEmployee'
import { projectEmployeeFileRouter } from './routers/projectEmployeeFile'
import { projectEmployeeHistoryRouter } from './routers/projectEmployeeHistory'
import { projectModelRouter } from './routers/projectModel'
import { projectModelFileRouter } from './routers/projectModelFile'
import { projectPQRRouter } from './routers/projectPQR'
import { projectPQRAnalysisRouter } from './routers/projectPQRAnalysis'
import { projectForecastingRouter } from './routers/projectForecasting'
import { projectForecastingFileRouter } from './routers/projectForecastingFile'
import { projectForecastingSeriesRouter } from './routers/projectForecastingSeries'
import { projectFraudTransactionRouter } from './routers/projectFraudTransaction'
import { organizationRouter } from './routers/organization'
import { organizationFileRouter } from './routers/organizationFile'
import { projectChatRouter } from './routers/projectChat'
import { projectMessageRouter } from './routers/projectMessage'
import { projectLeadsCompanyRouter } from './routers/projectLeadsCompany'
import { projectLeadsCompanyAnalysisRouter } from './routers/projectLeadsCompanyAnalysis'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  apiKeys: apiKeysRouter,
  organization: organizationRouter,
  organizationFile: organizationFileRouter,
  project: projectRouter,
  projectAgent: projectAgentRouter,
  projectAgentFile: projectAgentFileRouter,
  projectMember: projectMemberRouter,
  projectFile: projectFileRouter,
  projectFaq: projectFaqRouter,
  projectIntegration: projectIntegrationRouter,
  projectProductWarehouse: projectProductWarehouseRouter,
  projectProductFile: projectProductFileRouter,
  projectServiceFile: projectServiceFileRouter,
  projectCategory: projectCategoryRouter,
  projectProduct: projectProductRouter,
  projectService: projectServiceRouter,
  projectCustomer: projectCustomerRouter,
  projectCustomerFile: projectCustomerFileRouter,
  projectOrders: projectOrdersRouter,
  projectOrdersItems: projectOrdersItemsRouter,
  projectOrdersServices: projectOrdersServicesRouter,
  projectLead: projectLeadRouter,
  projectContact: projectContactRouter,
  projectDeal: projectDealRouter,
  projectLeadFile: projectLeadFileRouter,
  projectContactFile: projectContactFileRouter,
  projectDealMessage: projectDealMessageRouter,
  projectProductStockMovement: projectProductStockMovementRouter,
  projectAction: projectActionRouter,
  projectAgentActions: projectAgentActionsRouter,
  projectAgentTrigger: projectAgentTriggerRouter,
  projectAgentWorkflow: projectAgentWorkflowRouter,
  phoneNumber: phoneNumberRouter,
  projectPhoneNumber: projectPhoneNumberRouter,
  projectEmployee: projectEmployeeRouter,
  projectEmployeeFile: projectEmployeeFileRouter,
  projectEmployeeHistory: projectEmployeeHistoryRouter,
  projectModel: projectModelRouter,
  projectModelFile: projectModelFileRouter,
  projectPQR: projectPQRRouter,
  projectPQRAnalysis: projectPQRAnalysisRouter,
  projectForecasting: projectForecastingRouter,
  projectForecastingFile: projectForecastingFileRouter,
  projectForecastingSeries: projectForecastingSeriesRouter,
  projectFraudTransaction: projectFraudTransactionRouter,
  projectChat: projectChatRouter,
  projectMessage: projectMessageRouter,
  projectLeadsCompany: projectLeadsCompanyRouter,
  projectLeadsCompanyAnalysis: projectLeadsCompanyAnalysisRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
