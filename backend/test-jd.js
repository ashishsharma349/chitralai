const http = require('http');

// Helper to make HTTP requests inside Node.js
function makeRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const dataString = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: responseBody });
        }
      });
    });
    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
    if (body) {
      req.write(dataString);
    }
    req.end();
  });
}

// Executes a suite of normal and edge cases to verify Phase 1
async function runTests() {
  const normalResults = [];
  const edgeResults = [];

  const n1 = await makeRequest('POST', '/api/jobs', { title: 'Engineer', content: 'Design systems.' });
  normalResults.push({ id: 1, name: 'Standard JD', pass: n1.status === 201 && n1.body.title === 'Engineer' });

  const n2 = await makeRequest('POST', '/api/jobs', { title: 'Lead', content: 'Line 1\nLine 2\nLine 3' });
  normalResults.push({ id: 2, name: 'Multiline description', pass: n2.status === 201 });

  const n3 = await makeRequest('GET', '/api/jobs');
  normalResults.push({ id: 3, name: 'List JDs', pass: n3.status === 200 && Array.isArray(n3.body) });

  const firstId = n1.body.id;
  const n4 = await makeRequest('GET', `/api/jobs/${firstId}`);
  normalResults.push({ id: 4, name: 'Get by ID', pass: n4.status === 200 && n4.body.id === firstId });

  const n5 = await makeRequest('POST', '/api/jobs', { title: 'JS-Dev (Full-Stack!)', content: 'Node and React' });
  normalResults.push({ id: 5, name: 'Special characters title', pass: n5.status === 201 });

  const n6 = await makeRequest('POST', '/api/jobs', { title: 'Long Text Dev', content: 'a'.repeat(2000) });
  normalResults.push({ id: 6, name: 'Long content size', pass: n6.status === 201 });

  const n7 = await makeRequest('GET', '/api/jobs');
  normalResults.push({ id: 7, name: 'Check sorting descending', pass: n7.status === 200 && n7.body[0].id > n7.body[n7.body.length - 1].id });

  const n8 = await makeRequest('GET', `/api/jobs/${firstId}`);
  normalResults.push({ id: 8, name: 'Retrieve specific title matches', pass: n8.body.title === 'Engineer' });

  const n9 = await makeRequest('GET', `/api/jobs/${firstId}`);
  const hasFields = n9.body.id && n9.body.title && n9.body.content && n9.body.createdAt && n9.body.updatedAt;
  normalResults.push({ id: 9, name: 'Payload keys checked', pass: hasFields });

  const n10 = await makeRequest('POST', '/api/jobs', { title: 'Architect', content: 'Requirements:\n- Node\n- MySQL' });
  normalResults.push({ id: 10, name: 'Bulleted text format', pass: n10.status === 201 });

  const e1 = await makeRequest('POST', '/api/jobs', { title: '', content: 'Valid' });
  edgeResults.push({ id: 1, name: 'Empty title', pass: e1.status === 400 });

  const e2 = await makeRequest('POST', '/api/jobs', { title: 'Valid', content: '' });
  edgeResults.push({ id: 2, name: 'Empty content', pass: e2.status === 400 });

  const e3 = await makeRequest('POST', '/api/jobs', { title: 'Valid' });
  edgeResults.push({ id: 3, name: 'Missing content field', pass: e3.status === 400 });

  const e4 = await makeRequest('POST', '/api/jobs', { title: '   ', content: 'Valid' });
  edgeResults.push({ id: 4, name: 'Whitespace title', pass: e4.status === 400 });

  const e5 = await makeRequest('POST', '/api/jobs', { title: 'Valid', content: '   ' });
  edgeResults.push({ id: 5, name: 'Whitespace content', pass: e5.status === 400 });

  const e6 = await makeRequest('POST', '/api/jobs', { title: null, content: null });
  edgeResults.push({ id: 6, name: 'Null fields', pass: e6.status === 400 });

  const e7 = await makeRequest('GET', '/api/jobs/abc');
  edgeResults.push({ id: 7, name: 'Invalid ID format', pass: e7.status === 400 });

  const e8 = await makeRequest('GET', '/api/jobs/999999');
  edgeResults.push({ id: 8, name: 'Non-existent ID', pass: e8.status === 404 });

  const e9 = await makeRequest('GET', '/api/jobs/-5');
  edgeResults.push({ id: 9, name: 'Negative ID', pass: e9.status === 400 });

  const e10 = await makeRequest('POST', '/api/jobs', { title: "' OR '1'='1", content: 'SQLi title' });
  edgeResults.push({ id: 10, name: 'SQLi title text', pass: e10.status === 201 && e10.body.title === "' OR '1'='1" });

  const e11 = await makeRequest('POST', '/api/jobs', { title: 'SQLi content', content: "'; DROP TABLE job_descriptions; --" });
  edgeResults.push({ id: 11, name: 'SQLi content text', pass: e11.status === 201 });

  const e12 = await makeRequest('POST', '/api/jobs', { title: 'Large Dev', content: 'x'.repeat(10000) });
  edgeResults.push({ id: 12, name: 'Extreme content length', pass: e12.status === 201 });

  const e13 = await makeRequest('POST', '/api/jobs', '{"broken json":}');
  edgeResults.push({ id: 13, name: 'Invalid JSON request', pass: e13.status === 400 });

  const e14 = await makeRequest('PUT', `/api/jobs/${firstId}`, { title: 'New' });
  edgeResults.push({ id: 14, name: 'Method not implemented check', pass: e14.status === 404 });

  const e15 = await makeRequest('GET', '/api/jobs');
  const hasCORS = e15.headers['access-control-allow-origin'] !== undefined;
  edgeResults.push({ id: 15, name: 'CORS header verification', pass: hasCORS });

  console.log('\n--- VERIFICATION REPORT ---');
  console.log('\nNormal Cases (10/10):');
  normalResults.forEach(r => console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] Normal #${r.id}: ${r.name}`));
  
  console.log('\nEdge Cases (15/15):');
  edgeResults.forEach(r => console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] Edge #${r.id}: ${r.name}`));
  
  const allPassed = normalResults.every(r => r.pass) && edgeResults.every(r => r.pass);
  console.log(`\nFinal Result: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}\n`);
}

runTests();
