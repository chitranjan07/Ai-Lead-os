const base = process.env.API_BASE_URL || 'http://localhost:4000';
const paths = ['/api/health','/api/dashboard','/api/leads','/api/followups'];
for (const path of paths) {
  const res = await fetch(base + path);
  const text = await res.text();
  console.log(`${res.status} ${path}: ${text}`);
}
