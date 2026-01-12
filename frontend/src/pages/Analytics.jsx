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

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function Analytics() {
  const [monthly, setMonthly] = useState(null);
  const [categories, setCategories] = useState([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const monthlyRes = await getMonthlyAnalytics(year, month);
    const categoryRes = await getCategoryAnalytics(year, month);

    setMonthly(monthlyRes.data);
    setCategories(categoryRes.data);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Analytics</h2>

      {monthly && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
          Total spending this month
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          ₹{monthly.total_expense}
        </p>
      </div>
      )}

      <h3>Category Breakdown</h3>

      <div style={{ width: "400px", height: "300px" }}>
        <ResponsiveContainer>
          <div className="max-w-md mx-auto">
          <PieChart>
            <Pie
              data={categories}
              dataKey="total"
              nameKey="category"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={3}
            >
              {categories.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend/>
            <Tooltip />
          </PieChart>
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;