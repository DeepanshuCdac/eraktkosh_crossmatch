import React, { useEffect, useState } from "react";
import { DatePicker, Button, Spin } from "antd";
import dayjs from "dayjs";
import DataTable from "./DataTable";
import axios from "axios";
import Swal from "sweetalert2";
import { baseURL, SSoToken, userAgent } from "../BaseApi";

export default function HomePage() {
  const [selected, setSelected] = useState("crossmatch");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLength, setDataLength] = useState(0)

  useEffect(() => {
    document.title = "Quality Indicator Dashboard";
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleSearchClick = async () => {
    if (!selectedDate) {
      Swal.fire({
        icon: "question",
        title: "Missing Selection",
        text: "Please select a month and year before searching!",
      });
      return;
    }

    setTableData(null);
    setLoading(true);

    const selectedYear = selectedDate.year();
    const fromDate = dayjs(`${selectedYear}-01-01`);
    const toDate = dayjs(`${selectedYear}-12-01`);

    try {
      const response = await axios.get(`${baseURL}/qualityindicator/allgraph`, {
        params: {
          FromDate: fromDate.format("MMM-YYYY"),
          ToDate: toDate.format("MMM-YYYY"),
          varSSOTicketGrantingTicket: SSoToken,
          userAgent: userAgent,
        },
      });

      if (response?.data && response.data.length > 0) {
        console.log(response.data.length);
        setDataLength(response.data.length)
        
        setTableData(response.data);
      } else {
        Swal.fire({
          icon: "info",
          title: "No Data",
          text: "No data available for the selected month or year.",
        });
        setTableData([]);
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "error",
        title: "API Error",
        text: error.message || "Something went wrong while fetching data.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section>
        <div className="container">
          <div
            className={`mainModal ${isCollapsed ? "collapsed" : "expanded"}`}
            style={{ position: "relative" }}
          >
            <div className="mainHeader">
              <div className="crossmatchHeader">
                <div
                  className={`crossmatchHeading ${
                    selected === "crossmatch" ? "selected" : ""
                  }`}
                  onClick={() => setSelected("crossmatch")}
                >
                  <img src="assets/images/header_icon.svg" alt="" />
                  <div className="sampleName">NABH Quality Indicators</div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="collapses" onClick={toggleCollapse}>
                  <img
                    src="assets/images/less.svg"
                    alt=""
                    style={{
                      height: "16px",
                      width: "16px",
                      transform: isCollapsed
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                  <span className="icon_text">
                    {isCollapsed ? "Expand" : "Less"}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="search_fields d-flex align-items-center p-3 gap-4">
              <div className="d-flex align-items-center justify-content-center">
                <label className="label me-1">Select Month:</label>
                <DatePicker
                  onChange={(date) => setSelectedDate(date)}
                  allowClear={false}
                  picker="month"
                  format="MMM-YYYY"
                  placeholder="Select Month"
                  disabledDate={(current) => {
                    // Disable future months
                    return current && current >= dayjs().startOf("month");
                  }}
                />
              </div>

              <Button
                type="primary"
                onClick={handleSearchClick}
                loading={loading}
              >
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>

            {/* 🔹 Loader Overlay */}
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(255,255,255,0.7)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 999,
                }}
              >
                <Spin size="large" tip="Loading data..." />
              </div>
            )}
          </div>

          {/* DataTable */}
          {tableData && !loading && (
            <div className="mt-4">
              <DataTable
                data={tableData}
                selectedMonth={selectedDate}
                selectedYear={selectedDate ? selectedDate.year() : null}
                dataLength={dataLength}
                loading={loading}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
