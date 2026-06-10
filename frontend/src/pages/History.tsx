import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Calendar, ChevronRight, Trash2 } from 'lucide-react';

const API_BASE = "http://localhost:8000";

export const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHistory = history.filter(item => 
    item.idea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-4xl font-bold">Evaluation <span className="text-white/40 text-3xl ml-2 tracking-tight">History</span></h2>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 glass rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-6 flex items-center justify-between group transition-all glass-hover"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg line-clamp-1">{item.idea}</h4>
                  <p className="text-white/30 text-sm">
                    {new Date(item.created_at).toLocaleDateString()} • {item.executive_summary.substring(0, 60)}...
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="p-3 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-3 bg-white/5 rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredHistory.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl">
              <p className="text-white/30">No evaluations found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
