import { useEffect, useState } from "react";
import {
  getNextDayPrediction,
  getNextWeekPrediction,
  getNextMonthPrediction,
} from "../api/prediction";

import { getMonthlyAnalytics } from "../api/analytics";

function Prediction() {
  const [nextDay, setNextDay] = useState(null);
  const [nextWeek, setNextWeek] = useState(null);
  const [nextMonth, setNextMonth] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [lastMonth, setLastMonth] = useState(null)
  const [error, setError] = useState("");
  const today = new Date();

  const currentDayOfMonth = today.getDate();

  const daysInPreviousMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  ).getDate();

  const currentMonthDailyAverage =
    currentMonth
      ? currentMonth.total_expense / currentDayOfMonth
      : 0;

  const lastMonthDailyAverage =
    lastMonth
      ? lastMonth.total_expense / daysInPreviousMonth
      : 0;

  const paceChangePercent =
  lastMonthDailyAverage > 0
    ? (
        ((currentMonthDailyAverage -
          lastMonthDailyAverage) /
          lastMonthDailyAverage) *
        100
      ).toFixed(1)
    : 0;

  const forecastChangePercent =
  lastMonth && lastMonth.total_expense > 0
    ? (
        ((nextMonth?.predicted_next_month_expense -
          lastMonth.total_expense) /
          lastMonth.total_expense) *
        100
      ).toFixed(1)
    : 0;  

  let paceInsight = "";

  if (paceChangePercent > 20) {
    paceInsight =
      "⚠️ Your current spending pace is significantly higher than last month.";
  }
  else if (paceChangePercent > 5) {
    paceInsight =
      "📈 Your spending pace is slightly higher than last month.";
  }
  else if (paceChangePercent >= -5) {
    paceInsight =
      "📊 Your spending pace is consistent with last month.";
  }
  else {
    paceInsight =
      "✅ Your spending pace is lower than last month.";
  }

  let forecastInsight = "";

  if (forecastChangePercent > 20) {
    forecastInsight =
    "⚠️ Spending is projected to increase significantly next month.";
  }
  else if (forecastChangePercent > 5) {
    forecastInsight =
      "📈 Spending is projected to increase slightly next month.";
  }
  else if (forecastChangePercent >= -5) {
    forecastInsight =
      "📊 Spending is expected to remain stable next month.";
  }
  else {
    forecastInsight =
      "✅ Spending is projected to decrease next month.";
  }

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
  try {
    const dayRes = await getNextDayPrediction();
    const weekRes = await getNextWeekPrediction();
    const monthRes = await getNextMonthPrediction();
    const today = new Date();

    const currentMonthRes =
      await getMonthlyAnalytics({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      });

    const previousMonthDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

    const lastMonthRes =
      await getMonthlyAnalytics({
        year: previousMonthDate.getFullYear(),
        month: previousMonthDate.getMonth() + 1,
      });  

    setNextDay(dayRes.data);
    setNextWeek(weekRes.data);
    setNextMonth(monthRes.data);
    setCurrentMonth(currentMonthRes.data);
    setLastMonth(lastMonthRes.data);

  } catch (err) {
    setError("Unable to load predictions.");
  }
};

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Prediction</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

  {nextDay && (
    <div className="p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-500">
        Tomorrow's Expected Spending
      </p>

      <p className="text-2xl font-bold text-blue-600">
        ₹{Math.round(nextDay.random_forest_prediction)}
      </p>
    </div>
  )}

  {nextWeek && (
    <div className="p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-500">
        Projected Weekly Spending
      </p>

      <p className="text-2xl font-bold text-green-600">
        ₹{Math.round(nextWeek.predicted_next_week_expense)}
      </p>
    </div>
  )}

  {nextMonth && (
    <div className="p-4 rounded-lg shadow border">
      <p className="text-sm text-gray-500">
        Projected Monthly Spending
      </p>

      <p className="text-2xl font-bold text-purple-600">
        ₹{Math.round(nextMonth.predicted_next_month_expense)}
      </p>
    </div>
  )}

</div>

{lastMonth && nextMonth && (
  <div className="p-5 rounded-lg border shadow mt-6">
    <h3 className="text-lg font-semibold mb-3">
      Spending Insight
    </h3>

    <p>
      Last Month Spending:
      <span className="font-bold ml-2">
        ₹{Math.round(lastMonth.total_expense)}
      </span>
    </p>

    <p>
      Projected Next Month Spending:
      <span className="font-bold ml-2">
        ₹{Math.round(nextMonth.predicted_next_month_expense)}
      </span>
    </p>

    <p>
      Expected Change:
      <span className="font-bold ml-2">
        {forecastChangePercent}%
      </span>
    </p>
    <p className="mt-3 font-medium">
      {forecastInsight}
    </p>
  </div>
)}
{currentMonth && lastMonth && (
  <div className="p-5 rounded-lg border shadow mt-6">
    <h3 className="text-lg font-semibold mb-3">
      Spending Pace
    </h3>

    <p>
      Current Daily Average:
      <span className="font-bold ml-2">
        ₹{Math.round(currentMonthDailyAverage)}
      </span>
    </p>

    <p>
      Last Month Daily Average:
      <span className="font-bold ml-2">
        ₹{Math.round(lastMonthDailyAverage)}
      </span>
    </p>
    <p className="mt-3 font-medium">
      {paceInsight}
    </p>
  </div>
)}



      {error && <p>{error}</p>}
    </div>
  );
}

export default Prediction;