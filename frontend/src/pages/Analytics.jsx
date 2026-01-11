import { useEffect, useState } from "react";
import { getMonthlyAnalytics, getCategoryAnalytics } from "../api/analytics";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
      <h2>Analytics</h2>

      {monthly && (
        <div>
          <h3>
            Total for {month}/{year}: ₹{monthly.total_expense}
          </h3>
        </div>
      )}

      <h3>Category Breakdown</h3>

      <div style={{ width: "400px", height: "300px" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={categories}
              dataKey="total"
              nameKey="category"
              outerRadius={100}
            >
              {categories.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;