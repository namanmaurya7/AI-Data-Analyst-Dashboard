// Filter data
const filterData = (data, column, value) => {
  return data.filter((row) => row[column] === value);
};

// Group data + sum
const groupBySum = (data, groupColumn, valueColumn) => {
  const result = {};

  data.forEach((row) => {
    const key = row[groupColumn];
    const value = Number(row[valueColumn]) || 0;

    if (!result[key]) {
      result[key] = 0;
    }

    result[key] += value;
  });

  return result;
};

// Calculate average
const calculateAverage = (data, column) => {
  let total = 0;

  data.forEach((row) => {
    total += Number(row[column]) || 0;
  });

  return total / data.length;
};

// 🔥 ADD THIS FUNCTION (NEW)
const getTopN = (groupedData, limit) => {
  return Object.entries(groupedData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
};



const generateInsights = (operation, result) => {
  if (operation === "top") {
    const entries = Object.entries(result);

    if (entries.length === 0) return "No data available";

    const [topItem, value] = entries[0];

    // ✅ FORCE NUMBER
    const formattedValue = Number(value).toLocaleString("en-IN");

    return `Top product is ${topItem} with revenue ₹${formattedValue}`;
  }

  if (operation === "average") {
    const avg = Number(result.average);

    return `Average revenue is ₹${avg.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }

  return "No insights available";
};

module.exports = {
  filterData,
  groupBySum,
  calculateAverage,
  getTopN,
  generateInsights // ✅ added
};