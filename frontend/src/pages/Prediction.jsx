import { useEffect, useState } from "react";
import { getPrediction } from "../api/prediction";

function Prediction() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPrediction();
  }, []);

  const loadPrediction = async () => {
    try {
      const res = await getPrediction();
      setPrediction(res.data);
    } catch (err) {
      setError("Not enough data to generate prediction yet.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Prediction</h2>

      {prediction && (
        <div>
          <h3>
            <p className="text-lg font-bold text-green-600">
            Next month's Predicted Expense: ₹{prediction.predicted_next_month_expense}
            </p>
          </h3>
          <p className="text-sm text-gray-500">Based on last {prediction.months_used} months</p>
        </div>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}

export default Prediction;