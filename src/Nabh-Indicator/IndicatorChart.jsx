import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export default function IndicatorChart({
  data,
  dataKey,
  color = "#c41010",
  background = "#f1f9fe",
  selectedYear,
  ytdValue,
}) {
  const allMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = selectedYear || new Date().getFullYear();

  const dataMap = data.reduce((acc, item) => {
    if (item.month) {
      const key = item.month.toLowerCase();
      acc[key] = item[dataKey];
    }
    return acc;
  }, {});

  const values = allMonths.map((m) => {
    const keyShort = m.slice(0, 3).toLowerCase();
    const fullKey = `${keyShort}-${year}`;

    const val =
      dataMap[m.toLowerCase()] ?? dataMap[keyShort] ?? dataMap[fullKey] ?? null;

    return val;
  });

  const chartData = {
    labels: allMonths,
    datasets: [
      {
        label: `Trend (${year})`,
        data: values,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: background,
        tension: 0,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#dc8789",
      },
    ],
  };

  const backgroundColorPlugin = {
    id: "customCanvasBackgroundColor",
    beforeDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.fillStyle = background;
      ctx.fillRect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      );
      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        font: { size: 14, weight: "normal" },
      },
      annotation: ytdValue
        ? {
            annotations: {
              avgLine: {
                type: "line",
                yMin: ytdValue,
                yMax: ytdValue,
                borderColor: "#e57504",
                borderWidth: 1,
                borderDash: [6, 4],
                label: {
                  display: true,
                  content: `Avg: ${parseFloat(ytdValue).toFixed(2)}%`,
                  position: "end",
                  backgroundColor: "transparent",
                  color: "#e57504",
                  font: { size: 12, weight: "normal" },
                  padding: 4,
                  borderRadius: 4,
                  yAdjust: -15,
                },
              },
            },
          }
        : {},
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: "#444",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: { display: false, drawBorder: false },
        beginAtZero: true,
        ticks: { color: "#444" },
      },
    },
  };

  return (
    <Line
      data={chartData}
      options={options}
      height={120}
      plugins={[backgroundColorPlugin]}
    />
  );
}
