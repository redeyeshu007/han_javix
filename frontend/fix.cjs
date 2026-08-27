const fs = require('fs');
let data = fs.readFileSync('src/services/mockDb.ts', 'utf8');
data = data.replace(/projectId: 'TEST-PRJ-001'/g, "builderId: 'TEST-BLD-001', projectId: 'TEST-PRJ-001'");
fs.writeFileSync('src/services/mockDb.ts', data);
