import { Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, Rectangle, Sector, XAxis, YAxis } from 'recharts';
import type { Program } from '../lib/schema';
import { stageLabel } from '../lib/format';

const stageColors = ['#176c61', '#2d8074', '#4c8caf', '#775a9f', '#b39343', '#a45b54'];
const modalityColors = ['#176c61', '#9dbcb6'];

export default function LandscapeCharts({ programs }: { programs: Program[] }) {
  const stageMap = new Map<string, number>();
  const modalityMap = new Map<string, number>();

  programs.forEach((program) => {
    stageMap.set(program.evidenceStage, (stageMap.get(program.evidenceStage) ?? 0) + 1);
    const modality = program.modalityGroup === 'microsphere' ? '미립구' : '비미립구';
    modalityMap.set(modality, (modalityMap.get(modality) ?? 0) + 1);
  });

  const stageData = [...stageMap.entries()]
    .map(([name, value]) => ({ name: stageLabel(name), value }))
    .sort((a, b) => b.value - a.value);
  const modalityData = [...modalityMap.entries()].map(([name, value]) => ({ name, value }));

  return (
    <div className="panel-grid">
      <section className="panel panel-pad" aria-label="개발 단계 분포">
        <h3 className="panel-title">개발 단계 분포</h3>
        <div style={{ height: 280, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData} layout="vertical" margin={{ top: 8, right: 18, left: 26, bottom: 4 }}>
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={108} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#62706d' }} />
              <Tooltip cursor={{ fill: '#f1f6f5' }} />
              <Bar
                dataKey="value"
                radius={[0, 7, 7, 0]}
                shape={(props: any) => <Rectangle {...props} fill={stageColors[props.index % stageColors.length]} />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel panel-pad" aria-label="제형군 분포">
        <h3 className="panel-title">제형군 분포</h3>
        <div style={{ height: 230, marginTop: 12 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modalityData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                shape={(props: any) => <Sector {...props} fill={modalityColors[props.index % modalityColors.length]} />}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {modalityData.map((item, index) => (
            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: modalityColors[index], fontWeight: 760 }}>{item.name}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
