import { Env } from "./interfaces";
import { SpotifySyncMetric } from "./handlers/metrics";

export class MetricsRepo {
    private namespace : KVNamespace | null = null
    constructor(private env: Env) {
        this.namespace = env.METRICS
    }

    async add(metric: SpotifySyncMetric) {
        let value = await this.namespace!.get(metric.machineId)

        let data: SpotifySyncMetric[] = []
        if (value != null){
            data = JSON.parse(value) as SpotifySyncMetric[]
        }
        data.push(metric)
        value = JSON.stringify(data)

        await this.namespace!.put(metric.machineId, value)
    }

    async get(machineId: string): Promise<SpotifySyncMetric[]> {
        const { value, metadata } = await this.namespace!.getWithMetadata(machineId, {type: "text"});
        if (value == null){
            console.log(`No data for machineId -> ${machineId}`)
            return []
        }
        return JSON.parse(value) as SpotifySyncMetric[]
    }

    async getAll(): Promise<{ [machineId: string]: SpotifySyncMetric[] }> {
        console.log(`Getting all KV Keys`)
        let keys = []
        let listPage = {list_complete: false, cursor:undefined, keys: [] as any[]} as KVNamespaceListResult<any>
        while(!listPage.list_complete){
            listPage = await this.namespace!.list({cursor: listPage.cursor})
            for(const key of listPage.keys){
                keys.push(key.name)
            }
        }

        let ret = {} as { [machineId: string]: SpotifySyncMetric[] }
        for (const k of keys){
            let machineData = await this.get(k)

            if (machineData != null)
                ret[k] = machineData
        }

        return ret
    }

    async delete(machineId: string) {
        await this.namespace!.delete(machineId)
    }

    async deleteAll() {
        let listPage = {list_complete: false, cursor:undefined, keys: [] as any[]} as KVNamespaceListResult<any>
        while(!listPage.list_complete) {
            listPage = await this.namespace!.list({cursor: listPage.cursor})
            for (const key of listPage.keys) {
                console.log()
                await this.namespace!.delete(key.name)
            }
        }
    }
}

