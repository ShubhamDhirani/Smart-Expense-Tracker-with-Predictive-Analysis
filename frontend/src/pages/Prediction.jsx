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
      <h2>AI Prediction</h2>

      {prediction && (
        <div>
          <h3>
            Predicted next month expense: ₹
            {prediction.predicted_next_month_expense}
          </h3>
          <p>Based on last {prediction.months_used} months</p>
        </div>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}

export default Prediction;