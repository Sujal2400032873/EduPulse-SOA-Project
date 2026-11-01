import api from './api';

export const systemService = {
  checkAllServices: async () => {
    const serviceList = [
      { id: 'eureka-server', name: 'Eureka Registry Server', port: 8761, path: '/eureka/apps', role: 'Service Discovery Registry', isEureka: true },
      { id: 'api-gateway', name: 'API Gateway', port: 8080, path: '/auth/health', role: 'Edge Routing & Load Balancer' },
      { id: 'auth-service', name: 'Auth Service', port: 8081, path: '/auth/health', role: 'JWT Security & Role Control' },
      { id: 'student-service', name: 'Student Service', port: 8082, path: '/students/health', role: 'Demographics & Enrolment' },
      { id: 'attendance-service', name: 'Attendance Service', port: 8083, path: '/attendance/health', role: 'Daily Attendance Engine' },
      { id: 'result-service', name: 'Result Service', port: 8084, path: '/results/health', role: 'Transcript & GPA Computation' },
      { id: 'soap-student-lookup', name: 'SOAP Lookup Service', port: 8085, path: '/ws', role: 'Legacy SOAP 1.1 WSDL Endpoint', isSoap: true },
    ];

    const results = await Promise.all(
      serviceList.map(async (svc) => {
        const start = performance.now();
        try {
          if (svc.isEureka) {
            const res = await fetch('/eureka/apps', {
              headers: { 'Accept': 'application/json' }
            });
            const latency = Math.round(performance.now() - start);
            const isUp = res.ok;
            let registeredCount = null;
            try {
              const data = await res.json();
              registeredCount = data?.applications?.application?.length || 0;
            } catch (_) {}
            return {
              ...svc,
              status: isUp ? 'UP' : 'DOWN',
              latency,
              health: isUp ? 'HEALTHY' : 'UNREACHABLE',
              lastChecked: new Date().toLocaleTimeString(),
              registeredNodes: registeredCount,
            };
          }

          if (svc.isSoap) {
            // Check SOAP endpoint via POST
            const soapProbe = `<?xml version="1.0"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body/></soapenv:Envelope>`;
            const res = await fetch('/ws', {
              method: 'POST',
              headers: { 'Content-Type': 'text/xml' },
              body: soapProbe
            });
            const latency = Math.round(performance.now() - start);
            return {
              ...svc,
              status: res.status < 500 ? 'UP' : 'DOWN',
              latency,
              health: 'HEALTHY',
              lastChecked: new Date().toLocaleTimeString(),
            };
          }

          const res = await api.get(svc.path, { timeout: 4000 });
          const latency = Math.round(performance.now() - start);
          const isUp = res && (res.status === 'UP' || res.service);
          return {
            ...svc,
            status: isUp ? 'UP' : 'DEGRADED',
            latency,
            health: isUp ? 'HEALTHY' : 'WARNING',
            lastChecked: new Date().toLocaleTimeString(),
            details: res
          };
        } catch (err) {
          const latency = Math.round(performance.now() - start);
          return {
            ...svc,
            status: 'DOWN',
            latency,
            health: 'UNREACHABLE',
            error: err.message,
            lastChecked: new Date().toLocaleTimeString(),
          };
        }
      })
    );

    return results;
  }
};

export default systemService;
