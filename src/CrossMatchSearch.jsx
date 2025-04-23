import React, { useState } from "react";
import './App.scss'
import './crossmatch.scss'
import { DatePicker, Input, Button } from 'antd';
import CrossMatchCancelConfirm from "./CrossMatchCancelConfirm";
import CrossMatchCancellation from "./CrossMatchCancellation";

const CrossMatchSearch = () => {
    const [selected, setSelected] = useState("crossmatch");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showCrossMatchCancel, setShowCrossMatchCancel] = useState(false)

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const onChange = (date, dateString) => {
        console.log(date, dateString);
    };

    const handleSearch = () => {
        setShowCrossMatchCancel(true);
    }
    return (
        <>
            <main>
                <section>
                    <div className='container'>
                        <div className={`mainModal ${isCollapsed ? "collapsed" : "expanded"}`}>
                            <div className="mainHeader">
                                <div className="crossmatchHeader">
                                    <div
                                        className={`crossmatchHeading ${selected === "crossmatch" ? "selected" : ""}`}
                                        onClick={() => setSelected("crossmatch")} >
                                        <img src="assets/images/header_icon.svg" alt="" />
                                        <div className="sampleName">Crossmatch & Ready-to-issue Cancellation</div>
                                    </div>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div className="btns me-3">
                                        <Button type="primary" >Save</Button>
                                        <Button type="default">Cancel </Button>
                                    </div>
                                    <div className="collapses" onClick={toggleCollapse}>
                                        <img
                                            src="assets/images/less.svg"
                                            alt=""
                                            style={{
                                                height: '16px',
                                                width: '16px',
                                                transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                        />
                                        <span className="icon_text">{isCollapsed ? "Expand" : "Less"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="search_fields d-flex align-items-center p-3 justify-content-between">
                                <div className="d-flex align-items-center justify-content-center">
                                    <label className="label me-1">
                                        From Date:
                                    </label>
                                    <DatePicker onChange={onChange} />
                                </div>
                                <div className="d-flex align-items-center justify-content-center">
                                    <label className="label me-1">
                                        To Date:
                                    </label>
                                    <DatePicker onChange={onChange} />
                                </div>
                                <div className="divider"></div>
                                <div>
                                    <Input placeholder="Bag No." />
                                </div>
                                <div className="divider"></div>
                                <div>
                                    <Input placeholder="Requisition No." />
                                </div>
                                <div className="divider"></div>
                                <div>
                                    <Input placeholder="Patient Name/CR No." />
                                </div>
                                <Button type="primary" onClick={handleSearch}>Search</Button>

                            </div>
                        </div>
                        {showCrossMatchCancel && <CrossMatchCancellation/>}
                    </div>
                </section>
            </main>
        </>
    )
}

export default CrossMatchSearch