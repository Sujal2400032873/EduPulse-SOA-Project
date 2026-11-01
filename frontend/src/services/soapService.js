// SOAP Student Lookup Service
// Connects to Gateway at /ws (proxied to http://localhost:8085/ws)

export const soapService = {
  lookupStudent: async (studentId) => {
    const rawRequestXml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:stud="http://edupulse.com/soap/students">
  <soapenv:Header/>
  <soapenv:Body>
    <stud:getStudentRequest>
      <stud:studentId>${studentId}</stud:studentId>
    </stud:getStudentRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

    // Try relative /ws (handled by Vite proxy / Gateway) or fallback to direct Gateway url
    const url = '/ws';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': '""',
      },
      body: rawRequestXml,
    });

    if (!response.ok) {
      throw new Error(`SOAP Service returned HTTP ${response.status}: ${response.statusText}`);
    }

    const rawResponseXml = await response.text();

    // Parse XML in browser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawResponseXml, 'text/xml');

    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Failed to parse SOAP XML response: ' + parseError.textContent);
    }

    const getText = (tag) => {
      // Handle both with namespace and without
      const el = xmlDoc.getElementsByTagName(tag)[0] || 
                 xmlDoc.getElementsByTagNameNS('http://edupulse.com/soap/students', tag)[0];
      return el ? el.textContent.trim() : null;
    };

    const student = {
      studentId: getText('studentId') || studentId,
      name: getText('name') || 'N/A',
      email: getText('email') || 'N/A',
      department: getText('department') || 'N/A',
      year: parseInt(getText('year') || '1', 10),
      status: getText('status') || 'ACTIVE',
    };

    return {
      student,
      rawRequestXml,
      rawResponseXml,
    };
  },
};

export default soapService;
