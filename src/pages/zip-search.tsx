import { useReducer } from "react";
import { processItems } from "../lib/processItems.ts";

interface FormState {
  postalCode: string;
  searchQuery: string;
  results: any | null;
  isLoading: boolean;
  error: string | null;
}

type FormAction =
  | { type: "SET_POSTAL_CODE"; payload: string }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_RESULTS"; payload: any }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_POSTAL_CODE":
      return { ...state, postalCode: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_RESULTS":
      return { ...state, results: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default function ZipSearchPage() {
  const [state, dispatch] = useReducer(formReducer, {
    postalCode: "",
    searchQuery: "",
    results: null,
    isLoading: false,
    error: null,
  });

  const results: any = {};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_RESULTS", payload: null });

    try {
      const query = state.searchQuery.split(",");
      for (const q of query) {
        const response = await fetch(
          `/api/search?postal_code=${state.postalCode}&q=${q}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        const result = await processItems(data.items, state.postalCode);
        results[q] = result;
      }
      dispatch({ type: "SET_RESULTS", payload: results });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: (err as Error).message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Zip Code Search</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="postalCode" className="block mb-2">
            Postal Code:
          </label>
          <input
            type="text"
            id="postalCode"
            value={state.postalCode}
            onChange={(e) =>
              dispatch({ type: "SET_POSTAL_CODE", payload: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="searchQuery" className="block mb-2">
            Search Query:
          </label>
          <input
            type="text"
            id="searchQuery"
            value={state.searchQuery}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      {state.isLoading && <p>Loading...</p>}
      {state.error && <p className="text-red-500">Error: {state.error}</p>}
      {state.results && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(state.results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
