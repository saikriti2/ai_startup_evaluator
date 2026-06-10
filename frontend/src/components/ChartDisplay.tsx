import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ChartDisplayProps {
  type: 'revenue' | 'breakdown' | 'market' | 'timeline';
  data: any;
  title: string;
}

export const ChartDisplay = ({ type, data, title }: ChartDisplayProps) => {
  const COLORS = ['#0071e3', '#00d4ff', '#863bff', '#00c2ff', '#7e14ff'];

  if (type === 'revenue' && data.financial_projections) {
    const revenueData = [
      { year: 'Year 1', revenue: parseInt(data.financial_projections.year1_revenue?.replace(/[^0-9]/g, '') || 0) / 1000 },
      { year: 'Year 3', revenue: parseInt(data.financial_projections.year3_revenue?.replace(/[^0-9]/g, '') || 0) / 1000 },
      { year: 'Year 5', revenue: parseInt(data.financial_projections.year5_revenue?.replace(/[^0-9]/g, '') || 0) / 1000 }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 h-96"
      >
        <h3 className="text-lg font-semibold mb-4 text-white/90">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" />
            <XAxis stroke="rgba(255,255,255,0.5)" dataKey="year" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
              formatter={(value) => `$${value}K`}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={2} name="Revenue (K USD)" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === 'breakdown' && data.revenue_breakdown) {
    const breakdownData = Object.entries(data.revenue_breakdown).map(([key, value]) => ({
      name: key,
      value: parseInt(value as string)
    }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 h-96"
      >
        <h3 className="text-lg font-semibold mb-4 text-white/90">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdownData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {breakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (type === 'market' && data.market_size_breakdown) {
    const marketData = Object.entries(data.market_size_breakdown).map(([key, value]) => ({
      category: key,
      size: parseFloat(value as string)
    }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 h-96"
      >
        <h3 className="text-lg font-semibold mb-4 text-white/90">{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={marketData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" />
            <XAxis stroke="rgba(255,255,255,0.5)" dataKey="category" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}
              formatter={(value) => `$${value}B`}
            />
            <Bar dataKey="size" fill="#00d4ff" name="Market Size (Billions USD)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  return null;
};