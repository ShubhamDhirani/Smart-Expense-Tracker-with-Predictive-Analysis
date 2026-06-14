import { useEffect, useState } from "react";

import {
  getMonthlyAnalytics,
  getCategoryAnalytics,
} from "../api/analytics";

import { getAIInsights } from "../api/prediction";

function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [highestCategory, setHighestCategory] = useState("");
  const [dailyAverage, setDailyAverage] = useState(0);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const today = new Date();

      const currentRes =
        await getMonthlyAnalytics({
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        });

      const previousMonthDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      const lastRes =
        await getMonthlyAnalytics({
          year: previousMonthDate.getFullYear(),
          month: previousMonthDate.getMonth() + 1,
        });

      const categoryRes =
        await getCategoryAnalytics();

      setCurrentMonth(
        currentRes.data.total_expense
      );

      setLastMonth(
        lastRes.data.total_expense
      );

      setDailyAverage(
        today.getDate() > 0
          ? currentRes.data.total_expense / today.getDate()
          : 0
      );

      const categories =
        categoryRes.data;

      if (categories.length > 0) {
        const topCategory =
          categories.reduce((a, b) =>
            a.total > b.total ? a : b
          );

        setHighestCategory(
          topCategory.category
        );
      }

     getAIInsights()
      .then((res) => {
        setInsights(
          res.data.insights || []
        );
      })
      .catch(console.error)
      .finally(() => {
        setInsightsLoading(false);
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <div className="p-5 rounded-lg border shadow">
          <p className="text-sm text-gray-500">
            Current Month Spending
          </p>

          <p className="text-3xl font-bold text-blue-500">
            ₹{Math.round(currentMonth)}
          </p>
        </div>

        <div className="p-5 rounded-lg border shadow">
          <p className="text-sm text-gray-500">
            Last Month Spending
          </p>

          <p className="text-3xl font-bold text-green-500">
            ₹{Math.round(lastMonth)}
          </p>
        </div>

        <div className="p-5 rounded-lg border shadow">
          <p className="text-sm text-gray-500">
            Highest Category
          </p>

          <p className="text-2xl font-bold">
            {highestCategory}
          </p>
        </div>

        <div className="p-5 rounded-lg border shadow">
          <p className="text-sm text-gray-500">
            Average Daily Spend
          </p>

          <p className="text-2xl font-bold">
            ₹{Math.round(dailyAverage)}
          </p>
        </div>

      </div>

      <div className="p-5 rounded-lg border shadow">
        <h3 className="text-lg font-semibold mb-4">
          AI Financial Snapshot
        </h3>

        {insightsLoading ? (
          <p className="text-gray-400">
            Generating AI Financial Snapshot...
          </p>
        ) : (
          insights.map((item, index) => (
            <p
              key={index}
              className="mb-2"
            >
              • {item}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;