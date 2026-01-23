'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#8b5cf6', '#22c55e', '#3b82f6', '#ef4444'];

interface VerdictData {
  name: string;
  value: number;
}

interface GradeCompareData {
  grade: string;
  Gemini: number;
  Custom: number;
}

interface DashboardChartsProps {
  verdictData: VerdictData[];
  gradeCompareData: GradeCompareData[];
}

export function DashboardCharts({ verdictData, gradeCompareData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Verdict Distribution */}
      <div className="bg-white p-8 rounded-[28px] border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-6">전문가 판단 분포</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={verdictData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {verdictData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grade Comparison */}
      <div className="bg-white p-8 rounded-[28px] border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-6">등급 분포 비교</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeCompareData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="grade" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e4e4e7',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="Gemini" name="Gemini" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Custom" name="구축모델" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
