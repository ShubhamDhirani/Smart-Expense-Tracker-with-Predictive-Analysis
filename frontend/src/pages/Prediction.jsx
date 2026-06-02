import { useEffect, useState } from "react";
import {
  getNextDayPrediction,
  getNextWeekPrediction,
  getNextMonthPrediction,
} from "../api/prediction";

function Prediction() {
  const [nextDay, setNextDay] = useState(null);
  const [nextWeek, setNextWeek] = useState(null);
  const [nextMonth, setNextMonth] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
  try {
    const dayRes = await getNextDayPrediction();
    const weekRes = await getNextWeekPrediction();
    const monthRes = await getNextMonthPrediction();

    setNextDay(dayRes.data);
    setNextWeek(weekRes.data);
    setNextMonth(monthRes.data);

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

      {error && <p>{error}</p>}
    </div>
  );
}

export default Prediction;