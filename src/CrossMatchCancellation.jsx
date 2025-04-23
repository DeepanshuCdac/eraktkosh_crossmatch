import React, { useState } from "react";
import './crossmatch.scss';
import { Input, Checkbox, Collapse, Select, Table } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const CrossMatchCancellation = () => {

    const onChange = (e) => {
            console.log(`checked ${e.target.checked}`);
        };
    
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
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body "></div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-1 table_body ">3</div>
                            <div style={{ whiteSpace: 'nowrap' }} className="col-2 table_body  d-flex align-items-center">
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
                                title: 'Component',
                                dataIndex: 'component',
                                key: 'component',
                                render: (text) => (
                                    <div>
                                        <span>Component: </span>{" "}
                                        <span style={{ fontWeight: 400 }}>{text}</span>
                                    </div>
                                ),
                            },
                            {
                                title: 'Date',
                                dataIndex: 'date',
                                key: 'date',
                                render: (text) => (
                                    <div>
                                        <span>CrossMatch Date: </span>{" "}
                                        <span style={{ fontWeight: 400 }}>{text}</span>
                                    </div>
                                ),
                            },
                            {
                                title: 'CrossMatch',
                                dataIndex: 'crossMatch',
                                key: 'crossMatch',
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
                                component: 'Fresh Frozen Plasma',
                                date: '04-April-2025',
                                crossMatch: 'CrossMatch'
                            },
                            {
                                key: '2',
                                bagNo: '565464646546',
                                component: 'Plasma',
                                date: '04-April-2025',
                                crossMatch: 'Ready to issue'
                            },
                        ]}
                        pagination={false}
                        showHeader={false}
                        size="small"
                    />
                ),
            }
        ];
    return(
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
                                 <div style={{ whiteSpace: 'nowrap' }} className="col-1">CrossMatch Units</div>
                                 <div style={{ whiteSpace: 'nowrap' }} className="col-2">
                                     <Input placeholder="Remarks" />
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

export default CrossMatchCancellation