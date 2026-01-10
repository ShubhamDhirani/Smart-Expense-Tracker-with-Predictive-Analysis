import { useEffect, useState } from "react";
import {
  addExpense,
  getExpenses,
  deleteExpense,
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

  const loadExpenses = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExpense(form);
    setForm({
      amount: "",
      category: "",
      payment_mode: "",
      date: "",
      description: "",
    });
    loadExpenses();
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    loadExpenses();
  };

  return (
    <div>
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          placeholder="Payment Mode"
          value={form.payment_mode}
          onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button type="submit">Add</button>
      </form>

      <h2>Expenses</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Amount</th>
            <th>Category</th>
            <th>Payment</th>
            <th>Date</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td>{e.amount}</td>
              <td>{e.category}</td>
              <td>{e.payment_mode}</td>
              <td>{e.date}</td>
              <td>{e.description}</td>
              <td>
                <button onClick={() => handleDelete(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Expenses;