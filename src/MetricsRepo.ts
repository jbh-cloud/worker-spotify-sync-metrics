import { Env } from "./interfaces";
import { SpotifySyncMetric } from "./handlers/metrics";

export class MetricsRepo {
    private namespace : KVNamespace | null = null
    constructor(private env: Env) {
        this.namespace = env.METRICS
    }


    async add(metric: SpotifySyncMetric): Promise<boolean> {
        try {
            let value = await this.namespace!.get(metric.machineId)

            let data: SpotifySyncMetric[] = []
            if (value != null){
                data = JSON.parse(value) as SpotifySyncMetric[]
            }
            data.push(metric)
            value = JSON.stringify(data)

            await this.namespace!.put(metric.machineId, value)//, {metadata: product})
        }
        catch (e) {
            console.log(`Failed add metric for machine "${metric.machineId}", error: "${e}"`)
            return false
        }

        return true
    }


    async get(machineId: string): Promise<SpotifySyncMetric[] | null> {
        try {
            const { value, metadata } = await this.namespace!.getWithMetadata(machineId, {type: "text"});
            // Metadata seems to come through as a object anyway?
            // console.log(`val -> "${value}" - meta -> "${metadata}"`)
            // if(!metadata){
            //     console.log(`Failed get product "${sku}", no metadata`)
            //     return null
            // }

            if (value == null){
                console.log(`No data for machineId -> ${machineId}`)
                return null
            }
            return JSON.parse(value) as SpotifySyncMetric[]

        }
        catch (e) {
            console.log(`Failed getting metrics for machineId "${machineId}", error: "${e}"`)
            return null
        }
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

    async delete(machineId: string): Promise<boolean> {
        try{
            await this.namespace!.delete(machineId)
            return true
        }
        catch (e) {
            console.log(`deleteAll() failed with exception: ${e}`)
            return false
        }
    }

    async deleteAll(): Promise<boolean> {
        try{
            let listPage = {list_complete: false, cursor:undefined, keys: [] as any[]} as KVNamespaceListResult<any>
            while(!listPage.list_complete){
                listPage = await this.namespace!.list({cursor: listPage.cursor})
                for(const key of listPage.keys){
                    console.log()
                    await this.namespace!.delete(key.name)
                }
            }
            return true
        }
        catch (e) {
            console.log(`deleteAll() failed with exception: ${e}`)
            return false
        }
    }
}

