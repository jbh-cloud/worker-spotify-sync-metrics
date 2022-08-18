import { Router } from 'itty-router';
import {getMetrics, getMetricsPerMachine, getMachineIds, storeMetrics, deleteMachineMetrics, deleteAllMetrics} from './handlers/metrics';
import { Env, IRequest} from './interfaces'
import {requireAuthentication, isAuthenticated} from './auth'
import Toucan from 'toucan-js';
import { addSentry } from './sentry';

const router = Router();

router
    .get(
        '/api/*',
        (request: IRequest, env: Env, ctx: ExecutionContext) => addSentry(request, env, ctx),
        (request: IRequest, env: Env) => isAuthenticated(request, env),
        (request: IRequest, env: Env) => requireAuthentication(request, env)
    )
    .post(
        '/api/*',
        (request: IRequest, env: Env, ctx: ExecutionContext) => addSentry(request, env, ctx),
        (request: IRequest, env: Env) => isAuthenticated(request, env),
        (request: IRequest, env: Env) => requireAuthentication(request, env)
    )
    .delete(
        '/api/*',
        (request: IRequest, env: Env, ctx: ExecutionContext) => addSentry(request, env, ctx),
        (request: IRequest, env: Env) => isAuthenticated(request, env),
        (request: IRequest, env: Env) => requireAuthentication(request, env)
    )
    .get('/api/metrics/:machineId', async (request: IRequest, env: Env) => getMetricsPerMachine(request, env))
    .get('/api/metrics-all', async (request: IRequest, env: Env) => getMetrics(request, env))
    .get('/api/machine-ids', async (request: IRequest, env: Env) => getMachineIds(request, env))

    .post('/api/metrics', async (request: IRequest, env: Env) => storeMetrics(request, env))

    .delete('/api/metrics/:machineId', async (request: IRequest, env: Env) => deleteMachineMetrics(request, env))
    .delete('/api/metrics-all', async (request: IRequest, env: Env) => deleteAllMetrics(request, env))

    // catch non-matching routes
    .get('*', () => new Response('Not found', { status: 404 }))
    .post('*', () => new Response('Not found', { status: 404 }))
    .delete('*', () => new Response('Not found', { status: 404 }))

export default router
