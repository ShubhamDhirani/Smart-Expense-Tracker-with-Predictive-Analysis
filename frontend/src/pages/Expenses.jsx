import { useEffect, useState } from "react";
import {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} from "../api/expenses";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    payment_mode: "",
    date: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);

  const loadExpenses = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const resetForm = () => {
    setForm({
      amount: "",
      category: "",
      payment_mode: "",
      date: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId !== null) {
      await updateExpense(editingId, form);
    } else {
      await addExpense(form);
    }

    resetForm();
    loadExpenses();
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    loadExpenses();
  };

  const handleEdit = (expense) => {
    setForm({
      amount: expense.amount,
      category: expense.category,
      payment_mode: expense.payment_mode,
      date: expense.date,
      description: expense.description || "",
    });
    setEditingId(expense.id); // ✅ FIXED HERE
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 items-end">
          <input
            className="border p-2 rounded w-full 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            className="border p-2 rounded w-full 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            className="border p-2 rounded w-full 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Payment Mode"
            value={form.payment_mode}
            onChange={(e) =>
              setForm({ ...form, payment_mode: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       placeholder-gray-400 dark:placeholder-gray-500"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            className="border p-2 rounded w-full 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100 
                       placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {editingId !== null ? "Update" : "Add"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <h2 className="mt-6 mb-2 font-semibold">Expenses:</h2>

      <table className="w-full border-collapse mt-4">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Amount</th>
            <th className="border p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Category</th>
            <th className="border p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Payment</th>
            <th className="border p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Date</th>
            <th className="border p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Description</th>
            <th className="border p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Action</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((e) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700" key={e.id}>
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100">{e.amount}</td>
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100">{e.category}</td>
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100">{e.payment_mode}</td>
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100">{e.date}</td>
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100">{e.description}</td>
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100">
                <button
                  onClick={() => handleEdit(e)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                >
                  Edit
                </button>

                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(e.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;