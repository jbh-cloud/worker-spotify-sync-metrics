
export interface Env {
  METRICS_ADMIN_APIKEY: string;
  COUNTER: DurableObjectNamespace
  METRICS: KVNamespace
  METRICS_POST_APIKEY: string
  METRICS_GET_APIKEY: string
}

export interface SpotifySyncMetricDto {
  machineId: string,
  runType: string,
  runTypeAction: string,
  executionTime: string,
  executionId: string
  configHash: string,
  configMaxBitrate: string,
  configSkipLowQuality: boolean,
  configSpotifyPlaylistsEnabled: boolean,
  configSpotifyPlaylistsOwner: boolean,
  configPushover: boolean,
  configAutoscan: boolean
}


export interface IRequest extends Request {
  isAuthenticated: boolean
}