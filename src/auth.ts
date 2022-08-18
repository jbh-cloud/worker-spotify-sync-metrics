import { Env, IRequest } from "./interfaces"

export function isAuthenticated(request: IRequest, env: Env): void {
    switch(request.method){
        case 'GET': isReadAuthenticated(request, env); break;
        case 'POST': isAdminAuthenticated(request, env); break;
        case 'DELETE': isAdminAuthenticated(request, env); break;
        default: console.log(`isAuthenticated: Unsupported request.method -> ${request.method}`); break;
    }
}

export function isAdminAuthenticated(request: IRequest, env: Env): void {
    console.log('isAdminAuthenticated()')
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apikey')

    if (apiKey == null){
        request.isAuthenticated = false
        return
    }

    const [success, allowedMethods] = validateAdminApiKey(apiKey, env)
    request.isAuthenticated = allowedMethods.includes(request.method) && success
}

export function isReadAuthenticated(request: IRequest, env: Env): void {
    console.log('isReadAuthenticated()')

    isAdminAuthenticated(request, env)
    if (request.isAuthenticated)
        return

    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('apikey')
    if (apiKey == null){
        request.isAuthenticated = false
        return
    }

    console.log(`isReadAuthenticated() apiKey -> ${apiKey}}`)
    console.log(`isReadAuthenticated() env.METRICS_GET_APIKEY -> ${env.METRICS_GET_APIKEY}`)
    console.log(`isReadAuthenticated() matches -> ${apiKey == env.METRICS_GET_APIKEY}`)
    request.isAuthenticated = (apiKey == env.METRICS_GET_APIKEY)
}


export function requireAuthentication(request: IRequest, env: Env): Response | void {
    console.log(`requireAuthentication() request.isAuthenticated -> ${request.isAuthenticated}`)
    if (!request.isAuthenticated)
        return new Response('invalid auth', {status: 401})
}

function validateAdminApiKey(apiKeyIn: string, env: Env): [boolean, string[]] {
    console.log(`validateAdminApiKey() apiKeyIn -> ${apiKeyIn}`)
    console.log(`validateAdminApiKey() env.METRICS_ADMIN_APIKEY -> ${env.METRICS_ADMIN_APIKEY}`)

    // try to validate against normal private apikey
    if (env.METRICS_ADMIN_APIKEY == apiKeyIn)
        return [true, ['GET', 'POST', 'DELETE']]

    // fall back to public obscured post apikey
    var requestInboundDate = new Date()
    try{

        const decoded = atob(apiKeyIn)
        console.log(`validateAdminApiKey() decoded apikey -> ${decoded}`)
        const parts = decoded.split('/')

        const apiKey = parts[0].replaceAll('+', '-')
        console.log(`validateAdminApiKey() apiKey after replace -> ${apiKey}`)

        const requestOutboundDate = parseAsIso8601(parts[1])

        console.log(`validateAdminApiKey() requestOutboundDate -> ${requestOutboundDate}`)
        console.log(`validateAdminApiKey() requestInboundDate -> ${requestInboundDate}`)
        console.log(`validateAdminApiKey() requestInboundDateTime -> ${requestInboundDate.getTime()}`)
        console.log(`validateAdminApiKey() requestOutboundDateTime -> ${requestOutboundDate.getTime()}`)

        let millisecondDiff = Math.abs(requestInboundDate.getTime() - requestOutboundDate.getTime())
        console.log(`validateAdminApiKey() millisecondDiff -> ${millisecondDiff}`)

        // TODO: review delay timeout
        console.log(`validateAdminApiKey() ${millisecondDiff} <= ${env.METRICS_POST_TIME_INVALIDATOR} -> ${millisecondDiff <= env.METRICS_POST_TIME_INVALIDATOR}`)
        console.log(`validateAdminApiKey() ${env.METRICS_POST_APIKEY} == ${apiKey} -> ${env.METRICS_POST_APIKEY == apiKey}`)
        if (millisecondDiff <= env.METRICS_POST_TIME_INVALIDATOR && env.METRICS_POST_APIKEY == apiKey)
            return [true, ['POST']]

        return [false, []]

    }
    catch (e){
        console.log(`Failed validatePostApiKey, exception -> ${e}`)
        return [false, []]
    }
}

function parseAsIso8601(dateString: string): Date {
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    const hour = dateString.substring(9, 11)
    const minute = dateString.substring(11, 13)
    const second = dateString.substring(13, 15)

    const isoDateString = `${year}-${month}-${day}T${hour}:${minute}:${second}`
    console.log(`isoDateString -> ${isoDateString}`)

    return new Date(isoDateString)
}