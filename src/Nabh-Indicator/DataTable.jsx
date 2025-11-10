import React, { useState } from "react";
import { Table } from "antd";
import "./Nabh.scss";
import IndicatorChart from "./IndicatorChart";
import dayjs from "dayjs";

export default function DataTable({
  data,
  selectedMonth,
  loading,
  dataLength,
}) {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleExpand = (expanded, record) => {
    setExpandedRowKeys(expanded ? [record.key] : []);
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="mainModal mt-3">
        <p style={{ padding: "1rem", color: "red", fontWeight: 500 }}>
          No data available.
        </p>
      </div>
    );
  }

  const selectedMonthStr = selectedMonth
    ? dayjs(selectedMonth).format("MMM-YYYY")
    : null;

  const normalize = (s) => (s ? String(s).trim().toLowerCase() : "");

  const monthData =
    selectedMonthStr &&
    data.find((item) => {
      const monthField = normalize(item.month);
      const monthNameField = normalize(item.month_name);
      const sel = normalize(selectedMonthStr);

      if (monthField && monthField === sel) return true;

      if (monthNameField && item.year) {
        const combined = `${monthNameField}-${String(item.year)
          .trim()
          .toLowerCase()}`;
        if (combined === sel) return true;
      }

      if (monthNameField && monthNameField === sel) return true;

      return false;
    });

  if (!monthData) {
    return (
      <div className="mainModal mt-3">
        <p style={{ padding: "1rem", color: "red", fontWeight: 500 }}>
          No data available for {selectedMonthStr}.
        </p>
      </div>
    );
  }

  const getYtdAverage = (key) => {
    const validValues = data
      .map((item) => Number(item[key]))
      .filter((val) => !isNaN(val) && val !== null);

    if (validValues.length === 0) return "0.00";

    const total = validValues.reduce((sum, val) => sum + val, 0);
    return (total / validValues.length).toFixed(2);
  };

  const latest = monthData;

  const indicators = [
    // 1. TTI Rate (%)
    {
      key: 1,
      name: "TTI Rate (%)",
      latestValue: latest.tti_rate_percentage,
      ytdValue: getYtdAverage("tti_rate_percentage"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              (Combined TTI cases (HIV + HBV + Syphilis + MP) / Total No. of
              Donors) * 100
            </p>
            <div className="mb-3">
              <p className="details mb-1">Cases TTI Combined</p>
              <p className="number mb-0 p-2">{latest.tti_positive_cases}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total No. of Donors</p>
              <p className="number mb-0 p-2">{latest.total_donations}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total TTI %</p>
              <p className="number_per mb-0 p-2">{latest.tti_rate_percentage}%</p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              dataKey="tti_rate_percentage"
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              color="#c41010"
              ytdValue={getYtdAverage("tti_rate_percentage")}
            />
          </div>
        </div>
      ),
    },

    // 2. Adverse Transfusion Reaction Rate (%)
    {
      key: 2,
      name: "Adverse Transfusion Reaction Rate (%)",
      latestValue: latest.transfusion_reaction_rate,
      ytdValue: getYtdAverage("transfusion_reaction_rate"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              (No. of Transfusion Reactions / Total Bags Issued) * 100
            </p>
            <div className="mb-3">
              <p className="details mb-1">No. of Transfusion Reactions</p>
              <p className="number mb-0 p-2">
                {latest.transfusion_reaction_count}
              </p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total Bags Issued</p>
              <p className="number mb-0 p-2">{latest.total_bag_issue_count}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Reaction Rate %</p>
              <p className="number_per mb-0 p-2">
                {latest.transfusion_reaction_rate}%
              </p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              dataKey="transfusion_reaction_rate"
              color="#c41010"
              ytdValue={getYtdAverage("transfusion_reaction_rate")}
            />
          </div>
        </div>
      ),
    },

    // 3. Wastage Rate (%)
    {
      key: 3,
      name: "Wastage Rate (%)",
      latestValue: latest.wastage_rate_percentage,
      ytdValue: getYtdAverage("wastage_rate_percentage"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              (Total Discarded Bags / Total Donations) * 100
            </p>
            <div className="mb-3">
              <p className="details mb-1">Discard Count</p>
              <p className="number mb-0 p-2">{latest.discard_count}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total Donations</p>
              <p className="number mb-0 p-2">{latest.total_donations}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Wastage Rate %</p>
              <p className="number_per mb-0 p-2">
                {latest.wastage_rate_percentage}%
              </p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              dataKey="wastage_rate_percentage"
              color="#c41010"
              ytdValue={getYtdAverage("wastage_rate_percentage")}
            />
          </div>
        </div>
      ),
    },

    // 4. Turnaround Time (TAT)
    {
      key: 4,
      name: "Turnaround Time (TAT) of Blood Issues (mins)",
      latestValue: latest.tat_urgent_avg_minutes,
      ytdValue: getYtdAverage("tat_urgent_avg_minutes"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              Average time between blood request and issue (routine cases)
            </p>
            <div className="mb-3">
              <p className="details mb-1">Routine Average (mins)</p>
              <p className="number mb-0 p-2">
                {latest.tat_routine_avg_minutes}
              </p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Urgent Average (mins)</p>
              <p className="number_per mb-0 p-2">{latest.tat_urgent_avg_minutes}</p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              dataKey="tat_urgent_avg_minutes"
              color="#c41010"
              ytdValue={getYtdAverage("tat_urgent_avg_minutes")}
            />
          </div>
        </div>
      ),
    },

    // 5. Adverse Donor Reaction Rate (%)
    {
      key: 5,
      name: "Adverse Donor Reaction Rate (%)",
      latestValue: latest.donor_reaction_rate,
      ytdValue: getYtdAverage("donor_reaction_rate"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              (No. of Donors with Reaction / Total Donations) * 100
            </p>
            <div className="mb-3">
              <p className="details mb-1">Donors with Reaction</p>
              <p className="number mb-0 p-2">{latest.donors_with_reaction}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total Donations</p>
              <p className="number mb-0 p-2">{latest.total_donations}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Reaction Rate %</p>
              <p className="number_per mb-0 p-2">{latest.donor_reaction_rate}%</p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              dataKey="donor_reaction_rate"
              color="#c41010"
              ytdValue={getYtdAverage("donor_reaction_rate")}
            />
          </div>
        </div>
      ),
    },

    // 6. Donor Deferral Rate (%)
    {
      key: 6,
      name: "Donor Deferral Rate (%)",
      latestValue: latest.donor_deferral_rate,
      ytdValue: getYtdAverage("donor_deferral_rate"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              (No. of Donor Deferrals / Total Attempted Donations) * 100
            </p>
            <div className="mb-3">
              <p className="details mb-1">Donor Deferrals</p>
              <p className="number mb-0 p-2">{latest.donor_deferrals}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total Donations</p>
              <p className="number mb-0 p-2">{latest.total_donations}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Deferral Rate %</p>
              <p className="number_per mb-0 p-2">{latest.donor_deferral_rate}%</p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              dataKey="donor_deferral_rate"
              color="#c41010"
              ytdValue={getYtdAverage("donor_deferral_rate")}
            />
          </div>
        </div>
      ),
    },

    // 7. of Components Issued
    {
      key: 7,
      name: "% of Components Issued",
      latestValue: latest.percent_component_issues,
      ytdValue: getYtdAverage("percent_component_issues"),
      description: (
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-12 ">
            <h3 className="inner_table_header mb-1">Formula Used</h3>
            <p className="formula mb-3">
              (Total Components Issued / Total Whole Blood Collected) * 100
            </p>
            <div className="mb-3">
              <p className="details mb-1">Total Components Issued</p>
              <p className="number mb-0 p-2">{latest.total_component_issues}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">Total Whole Blood</p>
              <p className="number mb-0 p-2">{latest.total_whole_blood}</p>
            </div>
            <div className="mb-3">
              <p className="details mb-1">% of Components Issued</p>
              <p className="number_per mb-0 p-2">
                {latest.percent_component_issues}%
              </p>
            </div>
          </div>
          <div className="col-xl-8 col-lg-8 col-12">
            <IndicatorChart
              data={data}
              selectedYear={selectedMonth ? selectedMonth.year() : null}
              dataKey="percent_component_issues"
              color="#c41010"
              ytdValue={getYtdAverage("percent_component_issues")}
            />
          </div>
        </div>
      ),
    },
  ];

  console.log("🔹 Chart Data Summary 🔹");

  indicators.forEach((indicator) => {
    console.log({
      indicatorName: indicator.name,
      dataKey:
        indicator.description.props.children[1].props.children.props.dataKey,
      chartData: data.map((item) => ({
        month: item.month_name || item.month,
        value:
          item[
            indicator.description.props.children[1].props.children.props.dataKey
          ],
      })),
    });
  });

  const getMonthName = (item) => {
    if (!item) return "";
    return item.month_name
      ? item.month_name
      : item.month
      ? String(item.month).charAt(0).toUpperCase() + String(item.month).slice(1)
      : "";
  };

  const sortedData = [...data].sort((a, b) => {
    const dateA = dayjs(`${a.month_name || a.month}-${a.year}`, "MMM-YYYY");
    const dateB = dayjs(`${b.month_name || b.month}-${b.year}`, "MMM-YYYY");
    return dateA - dateB;
  });

  const firstMonth = getMonthName(sortedData[0]);
  const lastMonth = getMonthName(sortedData[sortedData.length - 1]);

  const columns = [
    {
      title: "Indicator Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Indicator Percentage (%)",
      dataIndex: "latestValue",
      key: "latestValue",
      render: (val) => (val !== undefined ? parseFloat(val).toFixed(2) : "-"),
    },
    {
      title: "Year average (%)",
      dataIndex: "ytdValue",
      key: "ytdValue",
    },
  ];

  return (
    <div className="mainModal mt-3">
      <div className="dataTable">
        <Table
          columns={columns}
          dataSource={indicators}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>{record.description}</div>
            ),
            expandedRowKeys,
            onExpand: handleExpand,
            expandRowByClick: true,
          }}
          expandIconColumnIndex={columns.length}
          rowClassName={(record) =>
            expandedRowKeys.includes(record.key) ? "expanded-parent-row" : ""
          }
        />
      </div>
    </div>
  );
}
