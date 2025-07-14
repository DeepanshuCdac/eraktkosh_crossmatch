import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./crossmatch.scss";
import { Input, Checkbox, Collapse, Select, Table, Empty, Alert } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

const CrossMatchCancelConfirm = forwardRef(
  ({ apiData, isConfirmation }, ref) => {
    const [selectedBags, setSelectedBags] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [headerRemarks, setHeaderRemarks] = useState("");
    const [individualRemarks, setIndividualRemarks] = useState({});
    const [verificationStatus, setVerificationStatus] = useState({});
    const [requisitionStatus, setRequisitionStatus] = useState({});
    const [validationError, setValidationError] = useState(false);

    useEffect(() => {
      if (isConfirmation) {
        const selectedData = getSelectedBagsData();
        console.log("Current Selection Data:", {
          selectedBags,
          verificationStatus,
          individualRemarks,
          computedData: selectedData,
        });
        console.log(
          "Formatted API Payload:",
          JSON.stringify(selectedData, null, 2)
        );
      }
    }, [selectedBags, verificationStatus, individualRemarks, isConfirmation]);

    const validateBeforeSave = () => {
      if (Object.keys(selectedBags).length === 0) {
        setValidationError("Please select at least one bag");
        return false;
      }

      // Check if all selected bags have a status selected
      const allHaveStatus = Object.entries(selectedBags).every(
        ([requisitionno, bagSet]) => {
          return Array.from(bagSet).every((bloodbagno) => {
            const statusKey = `${requisitionno}-${bloodbagno}`;
            return (
              verificationStatus[statusKey] &&
              verificationStatus[statusKey] !== "-1"
            );
          });
        }
      );

      if (!allHaveStatus) {
        setValidationError(
          "Please select cancellation status for all selected bags"
        );
        return false;
      }

      setValidationError(false);
      return true;
    };

    const getSelectedBagsData = () => {
    //   if (!validateBeforeSave()) {
    //     return null; // Return null if validation fails
    //   }

      if (!selectedBags || Object.keys(selectedBags).length === 0) {
        return [];
      }

      const normalizedData = normalizeData(apiData);
      if (!normalizedData || normalizedData.length === 0) {
        return [];
      }

      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(
        today.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${today.getFullYear()}`;

      const requisitionMap = {};

      Object.entries(selectedBags).forEach(([requisitionNo, bagSet]) => {
        const bags = Array.from(bagSet)
          .map((bloodBagNo) => {
            const bagData = normalizedData.find(
              (item) =>
                item.requisitionno?.toString() === requisitionNo &&
                item.bloodbagno?.toString() === bloodBagNo
            );

            if (!bagData) return null;

            const statusKey = `${requisitionNo}-${bloodBagNo}`;
            const remarkKey = `${requisitionNo}-${bloodBagNo}`;
            // const verificationStatusValue =
            //   verificationStatus[statusKey] || "-1";
            const individualRemark = individualRemarks[remarkKey] || "";

            const verificationStatusValue =
              verificationStatus[statusKey] ||
              requisitionStatus[requisitionNo] ||
              "-1";

            return {
              bloodBagNo: bagData.bloodbagno,
              bagSeqNo: bagData.bagseqno,
              cancellationRemark: bagData.cancelremarks,
              varificationRemark: individualRemark,
              cancellationDate: bagData.crossmatchdate,
              varificationDate: formattedDate,
              cancelFlag: verificationStatusValue,
              requisitionSlNo: bagData.requisitionslno,
              bagWithSeqNo: bagData.bagwithseqno,
              requesttype: bagData.requesttype?.toString(),
              requisitionNo: bagData.requisitionno,
              componentid: bagData.componentid,
            };
          })
          .filter(Boolean);

        if (bags.length > 0) {
          const countIndex = bags.length.toString();

          const compoString =
            bags.map((bag) => bag.componentid).join("#") + "#";

          requisitionMap[requisitionNo] = {
            requisition: requisitionNo,
            countIndex: countIndex,
            compoString: compoString,
            bagList: bags.map((bag) => {
              const { componentid, ...rest } = bag;
              return rest;
            }),
          };
        }
      });

      const result = Object.values(requisitionMap);

      if (isConfirmation) {
        console.log(
          "Selected Bags Data for Verification API:",
          JSON.stringify(result, null, 2)
        );
      }

      return result;
    };

    const handleRequisitionStatusChange = (requisitionno, status) => {
      setRequisitionStatus((prev) => ({
        ...prev,
        [requisitionno]: status,
      }));

      // Only update bags that don't have their own status set
      if (selectedBags[requisitionno] && selectedBags[requisitionno].size > 0) {
        setVerificationStatus((prev) => {
          const newVerificationStatus = { ...prev };
          selectedBags[requisitionno].forEach((bloodbagno) => {
            const statusKey = `${requisitionno}-${bloodbagno}`;
           
              newVerificationStatus[statusKey] = status;
            
          });
          return newVerificationStatus;
        });
      }
    };

    useImperativeHandle(ref, () => ({
  getSelectedBagsData,
  validate: () => {
    if (Object.keys(selectedBags).length === 0) {
      return { isValid: false, message: "Please select at least one bag" };
    }

    const invalidBags = [];
    Object.entries(selectedBags).forEach(([requisitionno, bagSet]) => {
      Array.from(bagSet).forEach((bloodbagno) => { 
        const statusKey = `${requisitionno}-${bloodbagno}`;
        if (!verificationStatus[statusKey] || verificationStatus[statusKey] === "-1") {
          invalidBags.push(bloodbagno);
        }
      });
    });

    if (invalidBags.length > 0) {
      return { 
        isValid: false, 
        message: `Please select cancellation status for all selected bags`
      };
    }

    return { isValid: true };
  }
}));

    const normalizeData = (data) => {   
      if (!data || data.length === 0) return [];

      if (data[0]?.crossmatchbag) {
        return data.flatMap((item) => {
          const crossmatchBags =  
            item.crossmatchbag?.map((bag) => ({
              requisitionno: item.requisitionno,
              requisitionraiseddate: item.requisitionraiseddate,
              patientname: item.patientname,
              agesex: item.agesex,
              priority: item.priority,
              requisitionstatus: item.requisitionstatus,
              cancelremarks: bag.cancelremarks,
              crossmatchunit: item.crossmatchunit,
              patcrno: item.patcrno,
              bloodbagno: bag.bloodbagno,
              componentid: bag.componentid,
              componentname: bag.componentname,
              bagseqno: bag.bagseqno,
              requisitionslno: bag.requisitionslno,
              bagwithseqno: bag.bagwithseqno,
              crossmatchdate: bag.crossmatchdate,
              requesttype: 1,
            })) || [];

          const readyToIssueBags =
            item.readytoIsusse?.map((bag) => ({
              requisitionno: item.requisitionno,
              requisitionraiseddate: item.requisitionraiseddate,
              patientname: item.patientname,
              agesex: item.agesex,
              priority: item.priority,
              requisitionstatus: item.requisitionstatus,
              crossmatchunit: item.crossmatchunit,
              patcrno: item.patcrno,
              cancelremarks: bag.cancelRemarks,
              bloodbagno: bag.bloodbagno,
              componentid: bag.componentid,
              componentname: bag.componentname,
              bagseqno: bag.bagseqno,
              requisitionslno: bag.requisitionslno,
              bagwithseqno: bag.bagwithseqno,
              crossmatchdate: bag.crossmatchdate,
              requesttype: 2,
            })) || [];

          return [...crossmatchBags, ...readyToIssueBags];
        });
      }

      return data;
    };

    const groupByRequisition = (data) => {
      if (!data || data.length === 0) return {};
      return data.reduce((acc, item) => {
        if (!acc[item.requisitionno]) {
          acc[item.requisitionno] = [];
        }
        acc[item.requisitionno].push(item);
        return acc;
      }, {});
    };

    const filterData = (data) => {
      if (!data || data.length === 0) return [];
      if (!searchText) return data;

      const lowerCaseSearch = searchText.toLowerCase();

      return data.filter((item) => {
        const statusText =
          item.requisitionstatus === 2 ? "accepted" : "pending";
        const priorityText = item.priority === 1 ? "routine" : "urgent";
        const requestTypeText =
          item.requesttype === 1 ? "crossmatch" : "ready to issue";

        const searchString = [
          item.requisitionno,
          item.patientname,
          item.bloodbagno,
          item.componentname,
          item.componentid,
          item.agesex,
          item.patcrno,
          item.crossmatchdate,
          item.bagwithseqno,
          statusText,
          priorityText,
          requestTypeText,
        ]
          .join(" ")
          .toLowerCase();

        return searchString.includes(lowerCaseSearch);
      });
    };

    const handleSelectAll = (e) => {
      const isChecked = e.target.checked;
      setSelectAll(isChecked);

      if (isChecked) {
        const allBags = {};
        const groupedData = groupByRequisition(normalizeData(apiData));
        Object.keys(groupedData).forEach((requisitionno) => {
          allBags[requisitionno] = new Set(
            groupedData[requisitionno].map((bag) => bag.bloodbagno)
          );
        });
        setSelectedBags(allBags);
      } else {
        setSelectedBags({});
      }
    };

    const handleRequisitionChange = (e, requisitionno, bags) => {
      const isChecked = e.target.checked;

      setSelectedBags((prev) => {
        const newSelectedBags = { ...prev };

        if (isChecked) {
          newSelectedBags[requisitionno] = new Set(
            bags.map((bag) => bag.bloodbagno)
          );
        } else {
          delete newSelectedBags[requisitionno];
        }

        return newSelectedBags;
      });
    };

    const handleBagChange = (e, requisitionno, bloodbagno) => {
      const isChecked = e.target.checked;

      setSelectedBags((prev) => {
        const newSelectedBags = { ...prev };

        if (!newSelectedBags[requisitionno]) {
          newSelectedBags[requisitionno] = new Set();
        }

        if (isChecked) {
          newSelectedBags[requisitionno].add(bloodbagno);
        } else {
          newSelectedBags[requisitionno].delete(bloodbagno);
          setVerificationStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[`${requisitionno}-${bloodbagno}`];
            return newStatus;
          });
          if (newSelectedBags[requisitionno].size === 0) {
            delete newSelectedBags[requisitionno];
            setRequisitionStatus((prev) => {
              const newReqStatus = { ...prev };
              delete newReqStatus[requisitionno];
              return newReqStatus;
            });
          }
        }

        return newSelectedBags;
      });
    };

    const handleIndividualRemarkChange = (
      requisitionno,
      bloodbagno,
      remark
    ) => {
      const remarkKey = `${requisitionno}-${bloodbagno}`;
      setIndividualRemarks((prev) => ({
        ...prev,
        [remarkKey]: remark,
      }));
    };

    const handleStatusChange = (requisitionno, bloodbagno, status) => {
      const statusKey = `${requisitionno}-${bloodbagno}`;
      setVerificationStatus((prev) => ({
        ...prev,
        [statusKey]: status,
      }));
      updateRequisitionStatusIfUniform(requisitionno);
    };

    const updateRequisitionStatusIfUniform = (requisitionno) => {
      const bagsInRequisition = selectedBags[requisitionno];
      if (!bagsInRequisition) return;

      const statuses = Array.from(bagsInRequisition).map((bloodbagno) => {
        const statusKey = `${requisitionno}-${bloodbagno}`;
        return verificationStatus[statusKey];
      });

      // If all bags have the same status, update requisition status
      const uniqueStatuses = [...new Set(statuses)];
      if (uniqueStatuses.length === 1) {
        setRequisitionStatus((prev) => ({
          ...prev,
          [requisitionno]: uniqueStatuses[0],
        }));
      }
    };

  useEffect(() => {
    const normalizedData = normalizeData(apiData);
    console.log(normalizeData, "normaliseData 328");

    const groupedData = groupByRequisition(normalizedData);
    console.log(groupedData, "groupedData 329");

    const allRequisitions = Object.keys(groupedData);
    console.log(allRequisitions, "Allrequistion 332");

    if (allRequisitions.length === 0) {
      setSelectAll(false);
      return;
    } else {
      setSelectAll(true);
    }

    const allSelected = allRequisitions.every((requisitionno) => {
      const bagsInReq = groupedData[requisitionno];
      const selectedBagsInReq = selectedBags[requisitionno] || new Set();
      return selectedBagsInReq.size === bagsInReq.length;
    });

    setSelectAll(allSelected);
  }, [selectedBags]);

  useEffect(() => {
  const normalizedData = normalizeData(apiData);
  const groupedData = groupByRequisition(normalizedData);
  const allRequisitions = Object.keys(groupedData);

  if (allRequisitions.length === 0) {
    setSelectAll(false);
    return;
  } else {
    setSelectAll(true);
  }

  const newSelectedBags = {};
  const newVerificationStatus = {};
  const newRequisitionStatus = {};

  allRequisitions.forEach((requisitionno) => {
    const bagsInReq = groupedData[requisitionno];
    newSelectedBags[requisitionno] = new Set(bagsInReq.map(bag => bag.bloodbagno));
    
    // Set default status for each bag
    bagsInReq.forEach(bag => {
      const statusKey = `${requisitionno}-${bag.bloodbagno}`;
      newVerificationStatus[statusKey] = "2"; // "2" is Confirm Cancellation
    });
    
    // Set default status for requisition
    newRequisitionStatus[requisitionno] = "2"; // "2" is Confirm Cancellation
  });

  setSelectedBags(newSelectedBags);
  setVerificationStatus(newVerificationStatus);
  setRequisitionStatus(newRequisitionStatus);
}, [apiData]);

    const getRequisitionCheckboxState = (requisitionno, bags) => {
      const selectedBagsInReq = selectedBags[requisitionno] || new Set();

      return {
        checked: selectedBagsInReq.size === bags.length && bags.length > 0,
        indeterminate:
          selectedBagsInReq.size > 0 && selectedBagsInReq.size < bags.length,
      };
    };

    const transformDataToItems = (data) => {
      const filteredData = filterData(data);
      const groupedData = groupByRequisition(filteredData);

      if (Object.keys(groupedData).length === 0) {
        return [
          {
            key: "no-data",
            label: <div className="table_row">No matching records found</div>,
            children: null,
          },
        ];
      }

      return Object.entries(groupedData).map(
        ([requisitionno, items], index) => {
          const firstItem = items[0];
          const bagCount = items.length;
          const { checked: isReqChecked, indeterminate: isReqIndeterminate } =
            getRequisitionCheckboxState(requisitionno, items);

          return {
            key: index.toString(),
            label: (
              <div className="table_row pb-2">
                <div className="row w-100 align-items-center">
                  <div className="col-2" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isReqChecked}
                      indeterminate={isReqIndeterminate}
                      onChange={(e) =>
                        handleRequisitionChange(e, requisitionno, items)
                      }
                    >
                      {requisitionno}
                    </Checkbox>
                  </div>
                  <div className="table_body col-2">
                    {firstItem.requisitionraiseddate || "N/A"}
                  </div>
                  <div className="col-2 table_body">
                    {firstItem.patientname?.trim() || "N/A"}
                  </div>
                  <div className="col-1 table_body">
                    {firstItem.agesex || "N/A"}
                  </div>
                  <div className="col-1 table_body">
                    {firstItem.priority === 1 ? "Routine" : "Urgent"}
                  </div>
                  <div className="col-1 table_body">
                    {firstItem.requisitionstatus === 2 ? "Accepted" : "Pending"}
                  </div>
                  {/* <div className="col-1 table_body"></div> */}
                  <div
                    style={{ whiteSpace: "nowrap" }}
                    className="col-1 table_body"
                  >
                    {bagCount}
                  </div>
                  <div
                    style={{ whiteSpace: "nowrap" }}
                    className="col-2 table_body d-flex align-items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="me-2">Is Cancel:</label>
                    <Select
                      defaultValue="2"
                      style={{ width: "100%" }}
                      options={[
                        { value: "-1", label: "Select Value" },
                        { value: "2", label: "Confirm Cancellation" },
                        { value: "3", label: "Revoke Cancellation" },
                      ]}
                      value={requisitionStatus[requisitionno] || "Select Value"}
                      onChange={(value) =>
                        handleRequisitionStatusChange(requisitionno, value)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            ),
            children: (
              <Table
                columns={[
                  {
                    title: "Checkbox",
                    dataIndex: "checkBox",
                    key: "checkBox",
                    render: (text, record) => (
                      <Checkbox
                        checked={(
                          selectedBags[record.requisitionno] || new Set()
                        ).has(record.bloodbagno)}
                        onChange={(e) =>
                          handleBagChange(
                            e,
                            record.requisitionno,
                            record.bloodbagno
                          )
                        }
                      >
                        <span>Bag No:</span>{" "}
                        <span style={{ fontWeight: 400 }}>
                          {record.bloodbagno}
                        </span>
                      </Checkbox>
                    ),
                  },
                  {
                    title: "CancelDate",
                    dataIndex: "cancelDate",
                    key: "cancelDate",
                    render: (text, record) => (
                      <div>
                        <span>Cancel Date: </span>{" "}
                        <span style={{ fontWeight: 400 }}>
                          {record.crossmatchdate || "N/A"}
                        </span>
                      </div>
                    ),
                  },
                  {
                    title: "VerificationStatus",
                    dataIndex: "verificationStatus",
                    key: "verificationStatus",
                    render: (text, record) => {
                      const statusKey = `${record.requisitionno}-${record.bloodbagno}`;
                      // Always use the bag-specific status if it exists, otherwise use requisition status
                      const currentStatus =
                        verificationStatus[statusKey] !== undefined
                          ? verificationStatus[statusKey]
                          : requisitionStatus[record.requisitionno] || "-1";

                      return (
                        <div onClick={(e) => e.stopPropagation()}>
                          <label className="me-2">Is Cancel:</label>
                          <Select
                            value={currentStatus || 2}
                            onChange={(value) =>
                              handleStatusChange(
                                record.requisitionno,
                                record.bloodbagno,
                                value
                              )
                            }
                            options={[
                              { value: "-1", label: "Select Value" },
                              { value: "2", label: "Confirm Cancellation" },
                              { value: "3", label: "Revoke Cancellation" },
                            ]}
                          />
                        </div>
                      );
                    },
                  },
                  {
                    title: "CrossMatchStatus",
                    dataIndex: "crossMatchStatus",
                    key: "crossMatchStatus",
                    render: (text, record) => (
                      <div>
                        {record.requesttype === 1 ? (
                          <span className="crossMatch">CrossMatch</span>
                        ) : (
                          <span className="readyToIssue">Ready to Issue</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "OldCancellationRemark",
                    dataIndex: "oldCancellationRemark",
                    key: "oldCancellationRemark",
                    render: (text, record) => (
                      <Input
                        size="small"
                        placeholder="No remarks"
                        value={record.cancelremarks}
                        disabled
                      />
                    ),
                  },
                  {
                    title: "VerificationRemark",
                    dataIndex: "verificationRemark",
                    key: "verificationRemark",
                    render: (text, record) => (
                      <Input
                        size="small"
                        placeholder="Enter Verification Remarks "
                        onChange={(e) => {
                          handleIndividualRemarkChange(
                            record.requisitionno,
                            record.bloodbagno,
                            e.target.value
                          );
                          // Clear header remarks if individual remark is modified
                          setHeaderRemarks("");
                        }}
                        value={
                          individualRemarks[
                            `${record.requisitionno}-${record.bloodbagno}`
                          ] || ""
                        }
                      />
                    ),
                  },
                ]}
                dataSource={items}
                pagination={false}
                showHeader={false}
                size="small"
                locale={{
                  emptyText: <Empty description="No bag details available" />,
                }}
              />
            ),
          };
        }
      );
    };

    const normalizedData = normalizeData(apiData);
    const hasData = normalizedData && normalizedData.length > 0;
    const items = hasData
      ? transformDataToItems(normalizedData)
      : [
          {
            key: "no-data",
            label: <div className="table_row pb-2">No data available</div>,
            children: null,
          },
        ];

    return (
      <main>
        <section>
          <div className="section_wrapper">
            {validationError && (
              <Alert
                message={validationError}
                type="error"
                showIcon
                className="mb-3"
              />
            )}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h4 className="section-header">CrossMatch Verification List</h4>
              <div>
                <Input
                  placeholder="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </div>
            </div>

            {hasData ? (
              <>
                <div className="table_header table_row p-2 mb-2">
                  <div className="row w-100 align-items-center">
                    <div className="col-2">
                      <Checkbox checked={selectAll} onChange={handleSelectAll}>
                        Requisition No.
                      </Checkbox>
                    </div>
                    <div className="col-2">Requisition Date</div>
                    <div className="col-2">Patient Name</div>
                    <div className="col-1">Gender/Age</div>
                    <div className="col-1">Priority</div>
                    <div className="col-1">Requisition Status</div>
                    {/* <div className="col-1">Status</div> */}
                    <div className="col-1">No. of Units</div>
                    <div className="col-2">
                      <Input
                        placeholder="Enter Verification Remarks"
                        style={{ width: "250px" }}
                        disabled={false}
                        value={headerRemarks}
                        onChange={(e) => {
                          setHeaderRemarks(e.target.value);
                          // Update all selected bags' individual remarks
                          const newRemarks = { ...individualRemarks };
                          Object.entries(selectedBags).forEach(
                            ([requisitionno, bagSet]) => {
                              Array.from(bagSet).forEach((bloodbagno) => {
                                const remarkKey = `${requisitionno}-${bloodbagno}`;
                                newRemarks[remarkKey] = e.target.value;
                              });
                            }
                          );
                          setIndividualRemarks(newRemarks);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="alternate-rows">
                  <Collapse
                    className="mb-2"
                    // accordion
                    items={items}
                    expandIcon={({ isActive }) =>
                      isActive ? <MinusOutlined /> : <PlusOutlined />
                    }
                  />
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Empty
                  description="No verification data available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }
);

export default CrossMatchCancelConfirm;
