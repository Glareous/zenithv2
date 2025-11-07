declare module 'swagger-ui-react' {
  import { ComponentType } from 'react'

  interface SwaggerUIProps {
    url?: string
    spec?: object
    onComplete?: (swaggerApi: any) => void
    requestInterceptor?: (request: any) => any
    responseInterceptor?: (response: any) => any
    docExpansion?: 'list' | 'full' | 'none'
    defaultModelsExpandDepth?: number
    defaultModelExpandDepth?: number
    defaultModelRendering?: 'example' | 'model'
    presets?: any[]
    plugins?: any[]
    layout?: string
    deepLinking?: boolean
    showExtensions?: boolean
    showCommonExtensions?: boolean
    filter?: boolean | string
    supportedSubmitMethods?: string[]
    tryItOutEnabled?: boolean
    persistAuthorization?: boolean
    withCredentials?: boolean
    oauth2RedirectUrl?: string
    requestSnippets?: any
    requestSnippetsEnabled?: boolean
    displayOperationId?: boolean
    displayRequestDuration?: boolean
    maxDisplayedTags?: number
    showMutatedRequest?: boolean
    syntaxHighlight?: any
    queryConfigEnabled?: boolean
    defaultExpanded?: boolean
    [key: string]: any
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>
  export default SwaggerUI
}