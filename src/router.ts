import { Router } from 'itty-router';
import {getMetrics, getMetricsPerMachine, storeMetrics, deleteMachineMetrics, deleteAllMetrics} from './handlers/metrics';
import { Env, IRequest} from './interfaces'
import {requireAuthentication, isAuthenticated} from './auth'

const router = Router({base: '/api'});

router
    .get(
        '*',
        (request: IRequest, env: Env) => isAuthenticated(request, env),
        (request: IRequest, env: Env) => requireAuthentication(request, env)
    )
    .post(
        '*',
        (request: IRequest, env: Env) => isAuthenticated(request, env),
        (request: IRequest, env: Env) => requireAuthentication(request, env)
    )
    .delete(
        '*',
        (request: IRequest, env: Env) => isAuthenticated(request, env),
        (request: IRequest, env: Env) => requireAuthentication(request, env)
    )
    .get('/metrics/:machineId', async (request: Request, env: Env) => getMetricsPerMachine(request, env))
    .get('/metrics-all', async (request: Request, env: Env) => getMetrics(request, env))

    .post('/metrics', async (request: Request, env: Env) => storeMetrics(request, env))

    .delete('/metrics/:machineId', async (request: Request, env: Env) => deleteMachineMetrics(request, env))
    .delete('/metrics-all', async (request: Request, env: Env) => deleteAllMetrics(request, env))

    // catch non-matching routes
    .get('*', () => new Response('Not found', { status: 404 }))
    .post('*', () => new Response('Not found', { status: 404 }))
    .delete('*', () => new Response('Not found', { status: 404 }))

export default router
