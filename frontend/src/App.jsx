import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisType, setAnalysisType] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  //helper function
  const formatChartData = (data) => {
    return Object.entries(data).map(([key, value]) => ({
      name: key,
      value: Number(value),
    }));
  };

  // Handle AI query
  const handleQuery = async () => {
    if (!query) return;

    setLoading(true); // ✅ start loading

    try {
      const res = await axios.post("http://localhost:5000/ai-query", {
        query,
      });

      setAnalysisResults((prev) => [
        ...prev,
        {
          type: res.data.ai?.operation === "top" ? "group" : "average",
          data: res.data.result || {},
          insight: res.data.insight || "No insight available",
          query: query, // ✅ store user query
        },
      ]);

      setQuery(""); // clear input
    } catch (err) {
      console.error(err);
    }

    setLoading(false); // ✅ stop loading
  };






  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
    
    {/* HEADER */}
    <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
      AI Data Analyst Dashboard 🚀
    </h1>

    {/* UPLOAD SECTION */}
    <div className="mb-8 flex items-center gap-4 bg-gray-800 p-4 rounded-xl shadow-lg">
      <input
        type="file"
        onChange={handleFileChange}
        className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      <button
        onClick={handleUpload}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
      >
        Upload CSV
      </button>
    </div>

    {/* ACTION BUTTONS */}
    <div className="flex gap-4 mb-6">
      <button
        onClick={async () => {
          const res = await axios.post("http://localhost:5000/analyze", {
            type: "group",
            groupColumn: "product",
            valueColumn: "revenue",
          });

          setAnalysisResults((prev) => [
            ...prev.filter((item) => item.type !== "group"),
            {
              type: "group",
              data: res.data,
              query: "Group by Product",
              insight: "Showing total revenue grouped by product",
            },
          ]);
        }}
        className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition"
      >
        Group by Product
      </button>

      <button
        onClick={async () => {
          const res = await axios.post("http://localhost:5000/analyze", {
            type: "average",
            column: "revenue",
          });
          setAnalysisResults((prev) => [
            ...prev.filter((item) => item.type !== "average"),
            {
              type: "average",
              data: res.data,
              query: "Average Revenue",
              insight: `Average revenue is ₹${Number(res.data).toLocaleString("en-IN")}`,
            },
          ]);
        }}
        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition"
      >
        Average Revenue
      </button>
    </div>

    {/* INPUT */}
    <div className="flex gap-3 mb-8">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask something like 'Top 5 products by revenue'"
        className="flex-1 bg-gray-800 border border-gray-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleQuery}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg shadow-md transition"
      >
        Send
      </button>
    </div>

    {/* TABLE */}
    {data.length > 0 && (
      <div className="overflow-auto mb-10 rounded-xl shadow-lg">
        <table className="w-full text-sm text-left border border-gray-700">
          <thead className="bg-gray-800 text-red-400 uppercase">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key} className="px-4 py-3 border-b border-gray-700">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-800 transition">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="px-4 py-2 border-b border-gray-700">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* RESULTS */}
    {analysisResults.length > 0 && (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-blue-400 text-center">
          📊 Insights Dashboard
        </h2>

        {analysisResults.map((result, index) => (
          <div key={index} className="space-y-3">

            {/* USER MESSAGE */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow max-w-xs break-words">
                {result.query}
              </div>
            </div>

            {/* AI RESPONSE */}
            <div className="flex justify-start">
              <div className="bg-gray-800 p-5 rounded-xl shadow-lg w-full max-w-2xl">

                {/* INSIGHT */}
                {result.insight && (
                  <div className="bg-purple-200 text-black p-3 rounded-lg mb-4 font-semibold shadow">
                    💡 {result.insight}
                  </div>
                )}

                {/* CHARTS */}
                {result.type === "group" && (
                  <div className="flex flex-wrap gap-6 justify-center">

                    <div className="bg-gray-900 p-3 rounded-lg shadow">
                      <h3 className="text-center font-semibold mb-2 text-blue-400">
                        Bar Chart
                      </h3>
                      <BarChart width={350} height={250} data={formatChartData(result.data)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </div>

                    <div className="bg-gray-900 p-3 rounded-lg shadow">
                      <h3 className="text-center font-semibold mb-2 text-green-400">
                        Line Chart
                      </h3>
                      <LineChart width={350} height={250} data={formatChartData(result.data)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#10b981" />
                      </LineChart>
                    </div>

                  </div>
                )}

                {/* AVERAGE */}
                {result.type === "average" && (
                  <div className="text-xl font-bold text-green-400 text-center">
                    {result.insight}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-4 py-2 rounded-lg animate-pulse text-gray-300 shadow">
              🤖 Thinking...
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
}

export default App;
