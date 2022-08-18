import {Env, SpotifySyncMetricDto } from '../interfaces'
import {MetricsRepo} from '../MetricsRepo'

export class SpotifySyncMetric implements SpotifySyncMetricDto {
  machineId: string = ''
  runType: string = ''
  runTypeAction: string = ''
  executionTime: string = ''
  executionId: string = ''
  configHash: string = ''
  configMaxBitrate: string = ''
  configSkipLowQuality: boolean = false
  configSpotifyPlaylistsEnabled: boolean = false
  configSpotifyPlaylistsOwner: boolean = false
  configPushover: boolean = false
  configAutoscan: boolean = false
  cfCountry: string = ''
}

function getMetricFromDto(dto: SpotifySyncMetricDto, request: Request): SpotifySyncMetric {
  let metric: SpotifySyncMetric =  {
    machineId: dto.machineId,
    runType: dto.runType,
    runTypeAction: dto.runTypeAction,
    executionTime: dto.executionTime,
    executionId: dto.executionId,
    configHash: dto.configHash,
    configMaxBitrate: dto.configMaxBitrate,
    configSkipLowQuality: dto.configSkipLowQuality,
    configSpotifyPlaylistsEnabled: dto.configSpotifyPlaylistsEnabled,
    configSpotifyPlaylistsOwner: dto.configSpotifyPlaylistsOwner,
    configPushover: dto.configPushover,
    configAutoscan: dto.configAutoscan,
    cfCountry: request.cf?.country ?? ''
  }
  return metric
}

export async function storeMetrics (request: Request, env: Env) {
  try {
    const payload = await request.json<SpotifySyncMetricDto>()

    if (payload.runType == null || payload.runTypeAction == null || payload.machineId == null || payload.executionTime == null || payload.executionId == null)
      return new Response('invalid post data', {status: 400})

    const metric = getMetricFromDto(payload, request)

    console.log(`storeMetrics machineId -> ${metric.machineId}`)
    console.log(`storeMetrics runType -> ${metric.runType}`)
    console.log(`storeMetrics runTypeAction -> ${metric.runTypeAction}`)
    console.log(`storeMetrics executionTime -> ${metric.executionTime}`)
    console.log(`storeMetrics executionId -> ${metric.executionId}`)

    const repo = new MetricsRepo(env)
    if (await repo.add(metric))
      return new Response('ok')

    return new Response('Failed adding metric', {status: 500})
  }
  catch (e) {
    return new Response(`${e}`, {status: 500})
  }
}


export async function getMetricsPerMachine(request: Request, env: Env){
  const machineId = request.url.split("?")[0].split('/').pop()
  console.log(`machineId -> ${machineId}`)

  const repo = new MetricsRepo(env)
  const metrics = await repo.get(machineId ?? '')

  return new Response(JSON.stringify(metrics ?? []))
}


export async function getMetrics(request: Request, env: Env){
  const repo = new MetricsRepo(env)
  return new Response(JSON.stringify(await repo.getAll()))
}


export async function deleteMachineMetrics(request: Request, env: Env){
  const machineId = request.url.split("?")[0].split('/').pop()
  console.log(`machineId -> ${machineId}`)

  const repo = new MetricsRepo(env)
  if (await repo.delete(machineId ?? ''))
    return new Response('ok')

  return new Response(`server failed deleting ${machineId}`, {status: 500})
}

export async function deleteAllMetrics(request: Request, env: Env){
  console.log(`deleteAllMetrics() called`)

  const repo = new MetricsRepo(env)
  if (await repo.deleteAll())
    return new Response('ok')

  return new Response(`server failed deleting all machine metrics`, {status: 500})
}