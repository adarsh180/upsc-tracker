'use client';

import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Calendar } from 'lucide-react';
import GlassCard from './GlassCard';

interface AdvancedChartsProps {
  efficiencyData: any[];
  heatmapData: any[];
  subjectData: any[];
  aiInsights: string;
}

export default function AdvancedCharts({ efficiencyData, heatmapData, subjectData, aiInsights }: AdvancedChartsProps) {
  // Generate heatmap grid
  const generateHeatmapGrid = () => {
    const grid = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let day = 1; day <= 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const data = heatmapData.find(h => h.day_of_week === day && h.hour === hour);
        grid.push({
          day: days[day - 1],
          hour,
          sessions: data?.sessions || 0,
          intensity: data?.sessions ? Math.min(data.sessions / 5, 1) : 0
        });
      }
    }
    return grid;
  };

  const heatmapGrid = generateHeatmapGrid();

  return (
    <div className="space-y-8">
      {/* Multi-Metric Performance Chart */}
      <GlassCard className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-400/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20">
            <TrendingUp className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-400">Multi-Metric Performance</h3>
            <p className="text-neutral-400">Hours studied vs Topics efficiency</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              yAxisId="hours"
              stroke="#3B82F6" 
              fontSize={12}
              tick={{ fill: '#3B82F6' }}
            />
            <YAxis 
              yAxisId="efficiency"
              orientation="right"
              stroke="#8B5CF6" 
              fontSize={12}
              tick={{ fill: '#8B5CF6' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px'
              }}
            />
            <Bar 
              yAxisId="hours"
              dataKey="total_hours" 
              fill="#3B82F6" 
              fillOpacity={0.6}
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="efficiency"
              type="monotone" 
              dataKey="topics_per_hour" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Efficiency Ratio Chart */}
      <GlassCard className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-400/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/20">
            <Zap className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-green-400">Study Efficiency Trends</h3>
            <p className="text-neutral-400">Topics and questions per hour ratio</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.6} />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF" 
              fontSize={12}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#10B981" 
              fontSize={12}
              tick={{ fill: '#10B981' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="topics_per_hour" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              name="Topics/Hour"
            />
            <Line 
              type="monotone" 
              dataKey="questions_per_hour" 
              stroke="#F59E0B" 
              strokeWidth={3}
              dot={{ fill: '#F59E0B', r: 4 }}
              name="Questions/Hour"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Study Time Heatmap */}
      <GlassCard className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-400/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20">
            <Calendar className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-purple-400">Weekly Study Heatmap</h3>
            <p className="text-neutral-400">Study session intensity by day and hour</p>
          </div>
        </div>

        <div className="grid grid-cols-24 gap-1 mb-4">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="text-xs text-center text-neutral-500 py-1">
              {hour}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-2">
              <div className="w-8 text-xs text-neutral-400">{day}</div>
              <div className="grid grid-cols-24 gap-1 flex-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = heatmapGrid.find(h => h.day === day && h.hour === hour);
                  const intensity = cell?.intensity || 0;
                  return (
                    <motion.div
                      key={`${day}-${hour}`}
                      className="w-4 h-4 rounded-sm cursor-pointer"
                      style={{
                        backgroundColor: intensity > 0 
                          ? `rgba(139, 92, 246, ${0.2 + intensity * 0.8})` 
                          : 'rgba(255, 255, 255, 0.05)'
                      }}
                      whileHover={{ scale: 1.2 }}
                      title={`${day} ${hour}:00 - ${cell?.sessions || 0} sessions`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (dayIndex * 24 + hour) * 0.001 }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-neutral-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: intensity > 0 
                    ? `rgba(139, 92, 246, ${0.2 + intensity * 0.8})` 
                    : 'rgba(255, 255, 255, 0.05)'
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </GlassCard>

      {/* AI Insights */}
      <GlassCard className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-yellow-400/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/20">
            <Zap className="w-7 h-7 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-yellow-400">AI Performance Insights</h3>
            <p className="text-neutral-400">Personalized recommendations based on your data</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="whitespace-pre-line text-neutral-300 leading-relaxed">
            {aiInsights || 'Analyzing your study patterns... Insights will appear here once you have more data.'}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}