import { useEffect, useState } from "react";

import { addExpense } from "../api/expenses";
import { getCategories } from "../api/categories";

function QuickExpense() {
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    amount: "",
    category_id: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!form.amount || !form.category_id) {
      alert("Please enter amount and category");
      return;
    }

    setLoading(true);

    try {
      await addExpense({
        amount: Number(form.amount),
        category_id: Number(form.category_id),
        description: form.description,

        payment_mode: "UPI",

        date: new Date()
          .toISOString()
          .split("T")[0],
      });

      setForm({
        amount: "",
        category_id: "",
        description: "",
      });

      alert("Expense added successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-lg border shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">
        Quick Add Expense
      </h3>

      <div className="grid md:grid-cols-4 gap-3">

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value,
            })
          }
          className="border p-2 rounded bg-white dark:bg-gray-800"
        />

        <select
          value={form.category_id}
          onChange={(e) =>
            setForm({
              ...form,
              category_id: e.target.value,
            })
          }
          className="border p-2 rounded bg-white dark:bg-gray-800"
        >
          <option value="">
            Category
          </option>

          {categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
            >
              {cat.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          className="border p-2 rounded bg-white dark:bg-gray-800"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          {loading
            ? "Adding..."
            : "Add Expense"}
        </button>

      </div>
    </div>
  );
}

export default QuickExpense;