import { useEffect } from "react";
import API from "./api/api";

function App() {
  useEffect(() => {
    API.get("/")
      .then((res) => console.log("Backend says:", res.data))
      .catch((err) => console.error(err));
  }, []);

  return <h1>Expense Tracker Frontend Running</h1>;
}

export default App;