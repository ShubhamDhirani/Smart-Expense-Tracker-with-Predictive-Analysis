import { useEffect, useState } from "react";
import {
  addExpense,
  getExpenses,
  deleteExpense,
  updateExpense,
} from "../api/expenses";
import { createCategory, getCategories } from "../api/categories";

const ADD_NEW_CATEGORY_VALUE = "__add_new_category__";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    category_id: "",
    payment_mode: "",
    date: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "Flexible",
    frequency: "",
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const loadExpenses = async () => {
    const res = await getExpenses();
    setExpenses(res.data);
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
      return res.data;
    } catch (err) {
      console.error("Error fetching categories", err);
      return [];
    }
  };

  useEffect(() => {
    loadExpenses();
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({
      amount: "",
      category_id: "",
      payment_mode: "",
      date: "",
      description: "",
    });
    setEditingId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      type: "Flexible",
      frequency: "",
    });
    setCategoryError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id) {
      alert("Please select a category");
      return;
    }

    if (editingId !== null) {
      await updateExpense(editingId, {
        ...form,
        category_id: Number(form.category_id),
      });
    } else {
      await addExpense({
        ...form,
        category_id: Number(form.category_id),
      });
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
      category_id:String(expense.category_id),
      payment_mode: expense.payment_mode,
      date: expense.date,
      description: expense.description || "",
    });
    setEditingId(expense.id); // ✅ FIXED HERE
  };

  const handleCategorySelect = (value) => {
    if (value === ADD_NEW_CATEGORY_VALUE) {
      setShowCategoryForm(true);
      setCategoryError("");
      return;
    }

    setShowCategoryForm(false);
    setCategoryError("");
    setForm({ ...form, category_id: value });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    const trimmedName = categoryForm.name.trim();
    if (!trimmedName) {
      setCategoryError("Please enter a category name.");
      return;
    }

    if (categoryForm.type === "Fixed" && !categoryForm.frequency.trim()) {
      setCategoryError("Please enter a frequency for fixed categories.");
      return;
    }

    setCategoryLoading(true);
    setCategoryError("");

    try {
      const payload = {
        name: trimmedName,
        type: categoryForm.type,
        frequency:
          categoryForm.type === "Fixed" ? categoryForm.frequency.trim() : null,
      };

      const res = await createCategory(payload);
      const createdCategory = res.data;

      await fetchCategories();
      setForm((current) => ({
        ...current,
        category_id: String(createdCategory.id),
      }));
      setShowCategoryForm(false);
      resetCategoryForm();
    } catch (err) {
      setCategoryError("Unable to create category right now.");
    } finally {
      setCategoryLoading(false);
    }
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

          <select
            className="border p-2 rounded w-full 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
            value={form.category_id}
            onChange={(e) => handleCategorySelect(e.target.value)}
          >
            <option value="">Select Category</option>

            {Array.isArray(categories) &&
              categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            <option value={ADD_NEW_CATEGORY_VALUE}>+ Add New Category</option>
          </select>

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

      {showCategoryForm && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-gray-900">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Create New Category
          </h3>

          <form onSubmit={handleCreateCategory} className="space-y-3">
            <input
              className="w-full rounded border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Category name"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
            />

            <select
              className="w-full rounded border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              value={categoryForm.type}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  type: e.target.value,
                  frequency: e.target.value === "Fixed" ? categoryForm.frequency : "",
                })
              }
            >
              <option value="Flexible">Flexible</option>
              <option value="Fixed">Fixed</option>
            </select>

            {categoryForm.type === "Fixed" && (
              <input
                className="w-full rounded border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Frequency"
                value={categoryForm.frequency}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    frequency: e.target.value,
                  })
                }
              />
            )}

            {categoryError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {categoryError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={categoryLoading}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {categoryLoading ? "Saving..." : "Save Category"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false);
                  resetCategoryForm();
                }}
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
              <td className="border p-2 text-center text-gray-900 dark:text-gray-100"> {Array.isArray(categories) ? categories.find(c => c.id === e.category_id)?.name || e.category_id : e.category_id} </td>
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
