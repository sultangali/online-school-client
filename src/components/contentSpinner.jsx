import React from 'react'
import { Spinner } from "react-bootstrap"

const ContentSpinner = () => {

    return (
        <div className=' d-flex row align-items-center justify-content-center content-spinner'>
            <Spinner animation="border" role="status" color='primary'>
                <span className="visually-hidden">Күтіңіз...</span>
            </Spinner>
        </div>)
}

export default ContentSpinner