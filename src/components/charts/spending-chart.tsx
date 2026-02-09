'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getCategoryColor } from '@/lib/utils';

interface SpendingChartProps {
    data: Record<string, number>;
}

export function SpendingChart({ data }: SpendingChartProps) {
    const chartData = Object.entries(data)
        .map(([name, value]) => ({
            name,
            value: Math.round(value * 100) / 100,
            color: getCategoryColor(name),
        }))
        .sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                No spending data available
            </div>
        );
    }

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                            percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                        }
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
