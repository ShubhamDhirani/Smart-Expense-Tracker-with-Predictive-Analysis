import { useEffect, useState } from "react";
import { getMonthlyAnalytics, getCategoryAnalytics } from "../api/analytics";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { getTrendData } from "../api/analytics";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];



function Analytics() {

  const [monthly, setMonthly] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const[trendData, setTrendData] = useState([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth()+1;

  const getDateParams = () => {
    const now = new Date();

    if (filter === "this_month") {
      return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      };
    }

    if (filter === "last_month") {
      const date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
    }

    if (filter === "today") {
      const todayStr = now.toISOString().split("T")[0];
      return {
        start_date: todayStr,
        end_date: todayStr,
      };
    }

    if (filter === "this_week") {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    };
  }
  if (filter === "custom"){
    if(!startDate || !endDate) return null;

    return {
      start_date: startDate,
      end_date: endDate,
    };
  }

  return null;
}

  useEffect(() => {
    loadAnalytics();
  }, [filter, startDate, endDate]);
  
  
  const loadAnalytics = async () => {
    const params = getDateParams();

    

    if (!params) return; 
    
    const trendRes = await getTrendData(params);
    setTrendData(trendRes.data);

    const monthlyRes = await getMonthlyAnalytics(params);
    const categoryRes = await getCategoryAnalytics(params);

    setMonthly(monthlyRes.data);
    setCategories(categoryRes.data);
  };
  const filteredTotal = 
    selectedCategory === "all"
      ? monthly?.total_expense
      : categories.find((c) => c.category === selectedCategory)?.total || 0;

  return (
    <><div>
      <h2 className="text-xl font-semibold mb-2">Analytics</h2>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="this_month">This Month</option>
        <option value="last_month">Last Month</option>
        <option value="this_week">This Week</option>
        <option value="today">Today</option>
        <option value="custom">Custom Range</option>
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="mb-4 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="all">All Categories</option>

        {categories.map((c, index) => (
          <option key={index} value={c.category}>
            {c.category}
          </option>
        ))}
      </select>

      {filter === "custom" && (
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded" />
        </div>
      )}

      {monthly && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total spending this month
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₹{filteredTotal}
          </p>
        </div>
      )}

      <h3>Category Breakdown</h3>

      <div style={{ width: "400px", height: "300px" }}>
        <ResponsiveContainer>
          <div className="max-w-md mx-auto">
            <PieChart>
              <Pie
                data={selectedCategory === "all"
                  ? categories
                  : categories.filter((c) => c.category === selectedCategory)}
                dataKey="total"
                nameKey="category"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={3}
              >
                {categories.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </div>
        </ResponsiveContainer>
      </div>
    </div><h3 className="mt-6">Spending Trend</h3><div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div></>
    
  );
}

export default Analytics;