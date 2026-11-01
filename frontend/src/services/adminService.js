import api from './api';
import { systemService } from './systemService';

export const adminService = {
  // Service Registry status for administrator monitoring
  getServiceRegistry: async () => {
    return await systemService.checkAllServices();
  },

  getSystemHealth: async () => {
    const services = await systemService.checkAllServices();
    const upCount = services.filter((s) => s.status === 'UP').length;
    const avgLatency = Math.round(
      services.reduce((acc, s) => acc + (s.latency || 0), 0) / (services.length || 1)
    );

    return {
      database: {
        name: 'PostgreSQL 18 [ERP]',
        port: 5433,
        status: 'UP',
        database: 'soa_hack',
        schemas: ['auth', 'student', 'attendance', 'result'],
        latencyMs: 2,
      },
      gateway: {
        name: 'Spring Cloud Gateway',
        port: 8080,
        status: upCount >= 4 ? 'UP' : 'DEGRADED',
        activeServices: `${upCount} / ${services.length}`,
        avgLatencyMs: avgLatency,
      },
      registry: {
        name: 'Netflix Eureka Server',
        port: 8761,
        status: 'UP',
        mode: 'Autonomous Discovery',
        registeredNodes: upCount,
      },
      auth: {
        name: 'JWT Security Provider',
        algorithm: 'HMAC-SHA256 (HS256)',
        tokenValidity: '24 Hours',
        status: 'ACTIVE',
      },
      nodes: services,
    };
  },
};

export default adminService;
