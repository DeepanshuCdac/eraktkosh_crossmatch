import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./crossmatch.scss";
import { Input, Checkbox, Collapse, Table, Empty } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";

const CrossMatchCancellation = forwardRef(({ apiData }, ref) => {
  const [selectedBags, setSelectedBags] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [headerRemarks, setHeaderRemarks] = useState("");
  const [individualRemarks, setIndividualRemarks] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [totalSelectedBags, setTotalSelectedBags] = useState(0);

  useEffect(() => {
    const count = Object.values(selectedBags).reduce(
      (sum, bagSet) => sum + bagSet.size,
      0
    );
    setTotalSelectedBags(count);

    if (count < 2 && headerRemarks.trim() !== "") {
      setHeaderRemarks("");
    }
  }, [selectedBags]);

  useEffect(() => {
    console.log(apiData, "apiData");

    if (apiData.length > 0) setSelectAll(true);
  }, [apiData]);

  const getSelectedBagsData = () => {
    if (!selectedBags || Object.keys(selectedBags).length === 0) {
      return [];
    }

    if (!validateRemarks()) {
      return null;
    }

    const normalizedData = normalizeData(apiData);
    if (!normalizedData || normalizedData.length === 0) {
      return [];
    }

    const selectedData = [];
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${today.getFullYear()}`;

    const selectedEntries = Object.entries(selectedBags).flatMap(
      ([reqNo, bagSet]) => {
        return Array.from(bagSet).map((bagNo) => ({
          requisitionNo: reqNo,
          bloodBagNo: bagNo,
        }));
      }
    );

    selectedEntries.forEach(({ requisitionNo, bloodBagNo }) => {
      const bagData = normalizedData.find(
        (item) =>
          item.requisitionno?.toString() === requisitionNo &&
          item.bloodbagno?.toString() === bloodBagNo
      );

      if (bagData) {
        const remarkKey = `${requisitionNo}-${bloodBagNo}`;
        const individualRemark = individualRemarks[remarkKey];
        console.log(individualRemark, 'individual remarks',headerRemarks);
        
        selectedData.push({
          requisitionNo: bagData.requisitionno,
          bloodBagNo: bagData.bloodbagno,
          bagSeqNo: bagData.bagseqno,
          cancellationRemark: individualRemark,
          cancellationDate: formattedDate,
          bagWithSeqNo: bagData.bagwithseqno,
          requesttype: bagData.requesttype?.toString() || "1",
        });
      }
    });

    return selectedData;
  };

  const validateRemarks = () => {
    const errors = {};
    let isValid = true;

    const selectedBagEntries = Object.entries(selectedBags).flatMap(
      ([reqNo, bagSet]) => {
        return Array.from(bagSet).map((bagNo) => ({
          requisitionNo: reqNo,
          bloodBagNo: bagNo,
        }));
      }
    );

    const hasHeaderRemarks = headerRemarks.trim() !== "";

    if (!hasHeaderRemarks) {
      selectedBagEntries.forEach(({ requisitionNo, bloodBagNo }) => {
        const remarkKey = `${requisitionNo}-${bloodBagNo}`;
        const hasIndividualRemark = individualRemarks[remarkKey]?.trim() !== "";

        if (!hasIndividualRemark) {
          errors[remarkKey] = "Remarks are required (either here or in header)";
          isValid = false;
        }
      });
    }

    setValidationErrors(errors);
    return isValid;
  };

  useImperativeHandle(ref, () => ({
    getSelectedBagsData,
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
      const statusText = item.requisitionstatus === 2 ? "accepted" : "pending";
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
    console.log(isChecked, "Ischecked");

    if (isChecked) {
      const allBags = {};
      const groupedData = groupByRequisition(normalizeData(apiData));
      console.log(groupedData, "groupData");

      Object.keys(groupedData).forEach((requisitionno) => {
        allBags[requisitionno] = new Set(
          groupedData[requisitionno].map((bag) => bag.bloodbagno)
        );
      });
      console.log(allBags, "AllBAgs");

      setSelectedBags(allBags);
    } else {
      setSelectedBags({});
    }
  };

  console.log(selectedBags, "selectedBags");

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
        if (newSelectedBags[requisitionno].size === 0) {
          delete newSelectedBags[requisitionno];
        }
      }

      return newSelectedBags;
    });
  };

  const handleIndividualRemarkChange = (requisitionno, bloodbagno, remark) => {
    const remarkKey = `${requisitionno}-${bloodbagno}`;
    setIndividualRemarks((prev) => ({
      ...prev,
      [remarkKey]: remark,
    }));
    console.log(remarkKey,remark, 'remark');
    
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[remarkKey];
      return newErrors;
    });
  };

  const handleHeaderRemarksChange = (e) => {
    // if (totalSelectedBags < 2) return;

    const value = e.target.value;
    setHeaderRemarks(value);

    // Update ALL selected bags with the new header remarks value
    // regardless of previous individual modifications
    setIndividualRemarks((prev) => {
      const updatedRemarks = { ...prev };
      let hasUpdates = false;

      Object.entries(selectedBags).forEach(([reqNo, bagSet]) => {
        Array.from(bagSet).forEach((bagNo) => {
          const remarkKey = `${reqNo}-${bagNo}`;
          updatedRemarks[remarkKey] = value;
          hasUpdates = true;
        });
      });

      return hasUpdates ? updatedRemarks : prev;
    });

    setValidationErrors({});
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

   allRequisitions.forEach((requisitionno) => {
      const bagsInReq = groupedData[requisitionno];
      //code to select bag

      setSelectedBags((prev) => {
        const newSelectedBags = { ...prev };
        newSelectedBags[requisitionno] = new Set(
          bagsInReq.map((bag) => bag.bloodbagno)
        );
        console.log(newSelectedBags,'newSleectedBags');
        
        return newSelectedBags;
      });
    
    
    });

    // setSelectAll(allSelected);
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

    return Object.entries(groupedData).map(([requisitionno, items], index) => {
      const firstItem = items[0];
      const bagCount = items.length;
      const { checked: isReqChecked, indeterminate: isReqIndeterminate } =
        getRequisitionCheckboxState(requisitionno, items);

      return {
        key: index.toString(),
        label: (
          <div className="table_row">
            <div className="row w-100 align-items-center">
              <div
                style={{ whiteSpace: "nowrap" }}
                className="col-2"
                onClick={(e) => e.stopPropagation()}
              >
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
              <div className="col-1 table_body">{bagCount}</div>
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
                        record.bloodbagno,
                        items
                      )
                    }
                  >
                    <span>Bag No:</span>{" "}
                    <span style={{ fontWeight: 400 }}>{record.bloodbagno}</span>
                  </Checkbox>
                ),
              },
              {
                title: "Component",
                dataIndex: "component",
                key: "component",
                render: (text, record) => (
                  <div>
                    <span>Component: </span>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {record.componentname}
                    </span>
                  </div>
                ),
              },
              {
                title: "Date",
                dataIndex: "date",
                key: "date",
                render: (text, record) => (
                  <div>
                    <span>CrossMatch Date: </span>{" "}
                    <span style={{ fontWeight: 400 }}>
                      {record.crossmatchdate}
                    </span>
                  </div>
                ),
              },
              {
                title: "Type",
                dataIndex: "type",
                key: "type",
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
                title: "Remarks",
                dataIndex: "remarks",
                key: "remarks",
                render: (text, record) => {
                  const remarkKey = `${record.requisitionno}-${record.bloodbagno}`;
                  const isSelected = (
                    selectedBags[record.requisitionno] || new Set()
                  ).has(record.bloodbagno);
                  const error = validationErrors[remarkKey];
                  const showAsRequired =
                    headerRemarks.trim() === "" && isSelected;
                  const isUsingHeaderRemark =
                    isSelected &&
                    headerRemarks.trim() !== "" &&
                    individualRemarks[remarkKey] === headerRemarks;

                  return (
                    <div>
                      <Input
                        size="small"
                        placeholder={
                          isUsingHeaderRemark
                            ? "Using header remarks"
                            : headerRemarks.trim()
                            ? "Override header remarks"
                            : "Enter Cancellation Remarks"
                        }
                        onChange={(e) =>
                          handleIndividualRemarkChange(
                            record.requisitionno,
                            record.bloodbagno,
                            e.target.value
                          )
                        }
                        value={individualRemarks[remarkKey] || ""}
                        status={showAsRequired && error ? "error" : ""}
                      />
                      {isUsingHeaderRemark && (
                        <div style={{ color: "green", fontSize: "12px" }}>
                          Using header remarks
                        </div>
                      )}
                      {showAsRequired && error && (
                        <div style={{ color: "red", fontSize: "12px" }}>
                          {error}
                        </div>
                      )}
                    </div>
                  );
                },
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
    });
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
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4 className="section-header mb-0">CrossMatch List</h4>
            <div>
              <Input
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 300 }}
              />
            </div>
          </div>

          {hasData ? (
            <>
              <div className="table_header table_row p-2 mb-2">
                <div className="row w-100 align-items-center">
                  <div style={{ whiteSpace: "nowrap" }} className="col-2">
                    <Checkbox checked={selectAll} onChange={handleSelectAll}>
                      Requisition No.
                    </Checkbox>
                  </div>
                  <div className="col-2">Requisition Date</div>
                  <div className="col-2">Patient Name</div>
                  <div className="col-1">Gender/Age</div>
                  <div className="col-1">Priority</div>
                  <div className="col-1">Requisition Status</div>
                  <div className="col-1">CrossMatch Units</div>
                  <div className="col-2">
                    <Input
                      style={{ width: "250px" }}
                      placeholder={
                           "Enter Cancellation Remarks"
                      }
                      value={headerRemarks}
                      onChange={handleHeaderRemarksChange}
                      status={
                        Object.keys(validationErrors).length > 0 &&
                        headerRemarks.trim() === ""
                          ? "error"
                          : ""
                      }
                      disabled={false}
                    />
                    {Object.keys(validationErrors).length > 0 &&
                      headerRemarks.trim() === "" && (
                        <div style={{ color: "red", fontSize: "12px" }}>
                          Enter remarks here or for each selected bag below
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="alternate-rows">
                <Collapse
                  className="pb-0 mb-2"
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
                description="No crossmatch data available"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
});

export default CrossMatchCancellation;
