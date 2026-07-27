import { Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, Rectangle, Sector, XAxis, YAxis } from 'recharts';
import type { DeliveryTechnology, Program } from '../lib/schema';
import { getIntervalBucket, intervalBucketLabels, stageLabel } from '../lib/format';

const stageColors = ['#176c61', '#2d8074', '#4c8caf', '#775a9f', '#b39343', '#a45b54'];
const technologyColors = ['#176c61', '#2d8074', '#4c8caf', '#775a9f', '#b39343', '#a45b54', '#7a8784'];
const intervalColors = ['#2d8074', '#4c8caf', '#775a9f', '#b39343', '#a45b54', '#62706d'];

export default function LandscapeCharts({ programs, deliveryTechnologies }: { programs: Program[]; deliveryTechnologies: DeliveryTechnology[] }) {
  const stageMap = new Map<string, number>();
  const technologyMap = new Map<string, number>();
  const intervalMap = new Map<string, number>();

  programs.forEach((program) => {
    stageMap.set(program.developmentStage, (stageMap.get(program.developmentStage) ?? 0) + 1);
    technologyMap.set(program.deliveryTechnologyId, (technologyMap.get(program.deliveryTechnologyId) ?? 0) + 1);
    const bucket = getIntervalBucket(program.productTarget);
    intervalMap.set(bucket, (intervalMap.get(bucket) ?? 0) + 1);
  });

  const stageData = [...stageMap.entries()]
    .map(([name, value]) => ({ name: stageLabel(name), value }))
    .sort((a, b) => b.value - a.value);
  const technologyData = deliveryTechnologies
    .filter((technology) => technologyMap.has(technology.id))
    .map((technology) => ({ name: technology.shortLabel, value: technologyMap.get(technology.id) ?? 0 }));
  const intervalData = Object.entries(intervalBucketLabels)
    .filter(([id]) => intervalMap.has(id))
    .map(([id, name]) => ({ name, value: intervalMap.get(id) ?? 0 }));

  return (
    <div className="panel-grid chart-grid">
      <section className="panel panel-pad" aria-label="개발 단계 분포">
        <h3 className="panel-title">개발 단계 분포</h3>
        <div style={{ height: 280, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData} layout="vertical" margin={{ top: 8, right: 18, left: 26, bottom: 4 }}>
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={108} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#62706d' }} />
              <Tooltip cursor={{ fill: '#f1f6f5' }} />
              <Bar dataKey="value" radius={[0, 7, 7, 0]} shape={(props: any) => <Rectangle {...props} fill={stageColors[props.index % stageColors.length]} />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel panel-pad" aria-label="제형별 분포">
        <h3 className="panel-title">제형별 분포</h3>
        <div style={{ height: 210, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={technologyData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={3} shape={(props: any) => <Sector {...props} fill={technologyColors[props.index % technologyColors.length]} />} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          {technologyData.map((item, index) => (
            <div key={item.name}><span style={{ color: technologyColors[index], fontWeight: 760 }}>{item.name}</span><strong>{item.value}</strong></div>
          ))}
        </div>
      </section>
      <section className="panel panel-pad" aria-label="제품 목표 간격 분포">
        <h3 className="panel-title">제품 목표 간격 분포</h3>
        <div style={{ height: 280, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intervalData} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 4 }}>
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#62706d' }} />
              <Tooltip cursor={{ fill: '#f1f6f5' }} />
              <Bar dataKey="value" radius={[0, 7, 7, 0]} shape={(props: any) => <Rectangle {...props} fill={intervalColors[props.index % intervalColors.length]} />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
