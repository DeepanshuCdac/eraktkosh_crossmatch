import React, { useState, useRef } from "react";
import "./App.scss";
import "./crossmatch.scss";
import { DatePicker, Input, Button } from "antd";
import CrossMatchCancellation from "./CrossMatchCancellation";
import axios from "axios";
import { baseURL, SSoToken, userAgent } from "./BaseApi";
import Swal from "sweetalert2";
import CrossMatchCancelConfirm from "./CrossMatchCancelConfirm";
import { useLocation } from "react-router-dom";

const CrossMatchSearch = () => {
  const location = useLocation();
  const isConfirmationRoute = location.pathname.includes("confirmation");
  const crossMatchRef = useRef();
  const [selected, setSelected] = useState("crossmatch");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCrossMatchCancel, setShowCrossMatchCancel] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [lastSearchType, setLastSearchType] = useState(null);
  const [searchValues, setSearchValues] = useState({
    bagNo: "",
    requisitionNo: "",
    patientName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleDateChange = (field, date) => {
    field === "from" ? setFromDate(date) : setEndDate(date);
  };

  const handleInputChange = (field, value) => {
    setSearchValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const fetchByDateRange = async () => {
    if (!fromDate || !endDate) {
      showErrorAlert("Please select date range!");
      return null;
    }

    try {
      const endpoint = isConfirmationRoute
        ? `${baseURL}/varification/date`
        : `${baseURL}/cancellation/date`;

      const response = await axios.get(endpoint, {
        params: {
          FromDate: fromDate.format("DD-MM-YYYY"),
          ToDate: endDate.format("DD-MM-YYYY"),
          varSSOTicketGrantingTicket: SSoToken,
          userAgent: userAgent,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Date range search error:", error);
      showErrorAlert(error.response?.data || "Failed to fetch by date range");
      return null;
    }
  };

  const searchRecords = async () => {
    try {
      const endpoint = isConfirmationRoute
        ? `${baseURL}/varification/search`
        : `${baseURL}/cancellation/search`;

      if (isConfirmationRoute) {
        // Verification/Confirmation search
        const requestBody = {
          FromDate: fromDate ? fromDate.format("DD-MM-YYYY") : "",
          ToDate: endDate ? endDate.format("DD-MM-YYYY") : "",
        };

        if (searchValues.requisitionNo) {
          requestBody.requisitionno = searchValues.requisitionNo;
        }
        if (searchValues.bagNo) {
          requestBody.BagNo = searchValues.bagNo;
        }
        if (searchValues.patientName) {
          if (/^\d+$/.test(searchValues.patientName)) {
            requestBody.patCrNo = searchValues.patientName;
          } else {
            requestBody.patientName = searchValues.patientName;
          }
        }

        const params = {
          varSSOTicketGrantingTicket: SSoToken,
          userAgent: userAgent,
        };

        const response = await axios.post(endpoint, requestBody, { params });
        return response.data;
      } else {
        // Cancellation search
        const params = {
          FromDate: fromDate ? fromDate.format("DD-MM-YYYY") : "",
          ToDate: endDate ? endDate.format("DD-MM-YYYY") : "",
          bag: searchValues.bagNo || "",
          requisition: searchValues.requisitionNo || "",
          cr: /^\d+$/.test(searchValues.patientName)
            ? searchValues.patientName
            : "",
          name: /^\d+$/.test(searchValues.patientName)
            ? ""
            : searchValues.patientName,
          varSSOTicketGrantingTicket: SSoToken,
          userAgent: userAgent,
        };

        const response = await axios.get(endpoint, { params });
        return response.data;
      }
    } catch (error) {
      console.error("Search error:", error);
      showErrorAlert(error.response?.data || "Search failed");
      return null;
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setShowCrossMatchCancel(false);

    try {
      let result = null;
      let searchParams = null;

      // Check if only dates are provided (no other fields)
      const onlyDatesProvided =
        (fromDate || endDate) &&
        !searchValues.bagNo &&
        !searchValues.requisitionNo &&
        !searchValues.patientName;

      if (onlyDatesProvided) {
        if (!fromDate || !endDate) {
          showErrorAlert("Please select both from and to dates!");
          return;
        }
        searchParams = { fromDate, endDate };
        result = await fetchByDateRange();
        setLastSearchType("dateRange");
      } else {
        // Check if at least one search criteria is provided
        const hasSearchCriteria =
          searchValues.bagNo ||
          searchValues.requisitionNo ||
          searchValues.patientName ||
          (fromDate && endDate);

        if (!hasSearchCriteria) {
          showErrorAlert("Please provide at least one search criteria!");
          return;
        }

        searchParams = {
          fromDate,
          endDate,
          bagNo: searchValues.bagNo,
          requisitionNo: searchValues.requisitionNo,
          patientName: searchValues.patientName,
        };

        setLastSearchType("fieldSearch");
        result = await searchRecords();
      }

      if (result) {
        setApiData(result);
        setShowCrossMatchCancel(true);
        setLastSearchParams(searchParams);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFromDate(null);
    setEndDate(null);
    setApiData(null);
    setSearchValues({
      bagNo: "",
      requisitionNo: "",
      patientName: "",
    });
    setActiveField(null);
    setShowCrossMatchCancel(false);
    setIsLoading(false);
  };

  const handlePatientNameChange = (e) => {
    const input = e.target.value;
    //  if (/^[a-zA-Z0-9]{0,18}$/.test(input)) {
    handleInputChange("patientName", input);
  // }
  }; 

  const handleSave = async () => {

    const selectedData = crossMatchRef.current?.getSelectedBagsData();

    if (selectedData === null) {
    // Show error message to user
    Swal.fire("Please provide all required remarks before submitting");
    return;
  }
  
  if (!selectedData || selectedData.length === 0) {
    Swal.fire("Please select at least one bag to cancel");
    return;
  }
    const selectedBagsData = crossMatchRef.current.getSelectedBagsData();
    console.log("Selected bags data to submit:", selectedBagsData);

    if (selectedBagsData.length === 0) {
      Swal.fire("Please select at least one bag");
      return;
    }

    try {
      const params = {
        varSSOTicketGrantingTicket: SSoToken,
        userAgent: userAgent,
      };

      if (isConfirmationRoute) {
        // Confirmation flow
        const verificationData = selectedBagsData.map((req) => ({
          requisition: req.requisition,
          countIndex: req.countIndex,
          compoString: req.compoString,
          bagList: req.bagList.map((bag) => ({
            bloodBagNo: bag.bloodBagNo,
            bagSeqNo: bag.bagSeqNo.toString(),
            cancellationRemark: bag.cancellationRemark || "",
            varificationRemark: bag.varificationRemark || "",
            cancellationDate: bag.cancellationDate || "",
            varificationDate: bag.varificationDate,
            cancelFlag: bag.cancelFlag,
            requisitionSlNo: bag.requisitionSlNo.toString(),
            bagWithSeqNo: bag.bagWithSeqNo,
            requesttype: bag.requesttype,
            requisitionNo: bag.requisitionNo,
          })),
        }));

        console.log("Verification API payload:", verificationData);

        const verificationResponse = await axios.post(
          `${baseURL}/varification/save`,
          verificationData,
          { params }
        );

        console.log("Verification response:", verificationResponse.data);

        await Swal.fire({
          title: "Success!",
          text: "Verification saved successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        // Cancellation flow
        const response = await axios.post(
          `${baseURL}/cancellation/save`,
          selectedBagsData,
          { params }
        );

        console.log(response);
        await Swal.fire({
          title: "Success!",
          text: "Cancellation saved successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
      }

      if (lastSearchParams && lastSearchType) {
        setIsLoading(true);
        setShowCrossMatchCancel(false);

        try {
          let result = null;
          if (lastSearchType === "dateRange") {
            result = await fetchByDateRange();
          } else {
            setActiveField(lastSearchParams.field);
            setSearchValues((prev) => ({
              ...prev,
              [lastSearchParams.field]: lastSearchParams.value,
            }));
            result = await searchRecords();
          }

          if (result) {
            setApiData(result);
            setShowCrossMatchCancel(true);
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire({
        title: "Error!",
        text: `Error saving ${
          isConfirmationRoute ? "verification" : "cancellation"
        }: ${error.message}`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const getHeaderText = () => {
    return isConfirmationRoute
      ? "Crossmatch & Ready-to-issue Confirmation"
      : "Crossmatch & Ready-to-issue Cancellation";
  };

  return (
    <main>
      <section>
        <div className="container">
          <div
            className={`mainModal ${isCollapsed ? "collapsed" : "expanded"}`}
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
                  <div className="sampleName">{getHeaderText()}</div>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="btns me-3">
                  <Button onClick={handleSave} type="primary">
                    Save
                  </Button>
                  <Button type="default" onClick={handleCancel}>
                    Clear
                  </Button>
                </div>
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

            <div className="search_fields d-flex align-items-center p-3 justify-content-between">
              <div className="d-flex align-items-center justify-content-center">
                <label className="label me-1">From Date:</label>
                <DatePicker
                  onChange={(date) => handleDateChange("from", date)}
                  value={fromDate}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <label className="label me-1">To Date:</label>
                <DatePicker
                  onChange={(date) => handleDateChange("to", date)}
                  value={endDate}
                />
              </div>

              <div className="divider"></div>

              <div>
                <Input
                  value={searchValues.bagNo}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^[a-zA-Z0-9]{0,18}$/.test(input)) {
                      handleInputChange("bagNo", input);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Bag No."
                />
              </div>

              <div className="divider"></div>
              <div>
                <Input
                  placeholder="Requisition No."
                  value={searchValues.requisitionNo}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (/^\d{0,18}$/.test(input)) {
                      handleInputChange("requisitionNo", input);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="divider"></div>
              <div>
                <Input
                  placeholder="Patient Name/CR No."
                  value={searchValues.patientName}
                  onChange={handlePatientNameChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Button
                type="primary"
                onClick={handleSearch}
                loading={isLoading}
                disabled={
                  !fromDate &&
                  !endDate &&
                  !searchValues.bagNo &&
                  !searchValues.requisitionNo &&
                  !searchValues.patientName
                }
              >
                Search
              </Button>
            </div>
          </div>

          {showCrossMatchCancel &&
            (isConfirmationRoute ? (
              <CrossMatchCancelConfirm
                ref={crossMatchRef}
                apiData={apiData}
                isConfirmation={location.pathname.includes("confirmation")}
              />
            ) : (
              <CrossMatchCancellation ref={crossMatchRef} apiData={apiData} />
            ))}
        </div>
      </section>
    </main>
  );
};

export default CrossMatchSearch;
