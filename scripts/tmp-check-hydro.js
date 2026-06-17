const fs = require('fs');
const arr = JSON.parse(fs.readFileSync('scripts/output/hydroelectric-scenario.json', 'utf8'));
for (const s of arr) {
  const childInfo = (s.children || [])
    .map((c) => `${c.componentName}:${c.props.earth3DId || c.props.mapId || '-'}:${c.businessElementId}`)
    .join(', ');
  console.log(`${s.componentName} ${s.businessElementId} children=[${childInfo}]`);
}
