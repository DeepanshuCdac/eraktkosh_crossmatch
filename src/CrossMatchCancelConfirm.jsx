import React, { useState } from "react";
import './crossmatch.scss';
import { Input, Checkbox, Collapse, Select, Table } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const CrossMatchCancelConfirm = () => {

    const onChange = (e) => {
        console.log(`checked ${e.target.checked}`);
    };

    const handleChange = (e) => {
        console.log(`selected ${e}`);
    }

    const items = [
        {
            key: '1',
            label: (
                <div className="table_row pb-2" >
                    <div className="row w-100 align-items-center" >
                        <div style={{ whiteSpace: 'nowrap' }} className="col-2" onClick={(e) => e.stopPropagation()}>
                            <Checkbox onChange={onChange}>99977785263140</Checkbox>
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }} className="table_body col-1">04-April-2025</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-2 table_body ">Anand Das Karam Chand</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body ">M/26</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body ">Routine</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body ">Accepted</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body ">Status</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body ">3</div>
                        <div style={{ whiteSpace: 'nowrap' }} className="col-2 table_body  d-flex align-items-center">
                            <Select
                                className="me-2"
                                defaultValue="Please Select"
                                style={{ width: 140 }}
                                onClick={(e) => e.stopPropagation()}
                                onChange={handleChange}
                                options={[
                                    { value: 'Confirm Cancellation', label: 'Confirm Cancellation' },
                                    { value: 'Dont Cancel', label: 'Dont Cancel' },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            ),
            children: (
                <Table
                    columns={[
                        {
                            title: 'Checkbox',
                            dataIndex: 'checkBox',
                            key: 'checkBox',
                            render: (text, record) => (
                                <Checkbox>
                                    <span>Bag No:</span>{" "}
                                    <span style={{ fontWeight: 400 }}>{record.bagNo}</span>
                                </Checkbox>
                            ),
                        },
                        {
                            title: 'CancelDate',
                            dataIndex: 'cancelDate',
                            key: 'cancelDate',
                            render: (text) => (
                                <div>
                                    <span>Cancel Date: </span>{" "}
                                    <span style={{ fontWeight: 400 }}>{text}</span>
                                </div>
                            ),
                        },
                        {
                            title: 'IsCancel',
                            dataIndex: 'isCancel',
                            key: 'isCancel',
                            render: () => (
                                <div>
                                <label className="me-2">Is Cancel:</label>
                                <Select
                                    defaultValue="Confirm Cancellation"
                                    options={[
                                        { value: 'Yes', label: 'Yes' },
                                        { value: 'No', label: 'No' },
                                    ]}
                                />
                                </div>
                            ),
                        },
                        {
                            title: 'CrossMatch',
                            dataIndex: 'crossMatch',
                            key: 'crossMatch',
                        },
                        {
                            title: 'WrongBloodInput',
                            dataIndex: 'wrongBloodInput',
                            key: 'wrongBloodInput',
                            render: () => (
                                <Input size="small" placeholder="Wrong Blood Input" disabled />
                            ),
                        },
                        {
                            title: 'Remarks',
                            dataIndex: 'remarks',
                            key: 'remarks',
                            render: () => (
                                <Input size="small" placeholder="Remarks" />
                            ),
                        },
                    ]}
                    dataSource={[
                        {
                            key: '1',
                            bagNo: '787879878897',
                            cancelDate: '04-April-2043',
                            crossMatch: 'Available',
                        },
                        {
                            key: '2',
                            bagNo: '565464646546',
                            cancelDate: '05-April-2043',
                            crossMatch: 'Issued',
                        },
                    ]}
                    pagination={false}
                    showHeader={false}
                    size="small"
                />
            ),
        }
    ];

    return (
        <main>
            <section>
                <div className="section_wrapper">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h4 className="section-header">CrossMatch List</h4>
                        <div>
                            <Input placeholder="Search" />
                        </div>
                    </div>
                    <div className="table_header table_row p-2 mb-2">
                        <div className="row w-100 align-items-center">
                            <div style={{ whiteSpace: 'nowrap' }} className="col-2">
                                <Checkbox onChange={onchange}>Requisition No.</Checkbox>
                            </div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1">Requisition Date</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-2">Patient Name</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1">Gender/Age</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1">Priority</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1">Requisition Status</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1">Status</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1">No. of Units</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-2">
                                <Input placeholder="Verification Remark" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Collapse className="p-2 pb-0 mb-2" accordion items={items}
                            expandIcon={({ isActive }) =>
                                isActive ? <MinusOutlined /> : <PlusOutlined />} />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CrossMatchCancelConfirm;
