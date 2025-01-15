import React from 'react'
import { Form } from "react-bootstrap"

const FormInput = ({errors, content, attributes, type}) => {

    return (<>
        <Form.Group className="mb-3">
            {errors ? (
                <Form.Label style={{ color: "red", fontWeight: '700' }}>
                    {errors?.message}
                </Form.Label>) : (<Form.Label style={{ fontWeight: '700'}}>{content}</Form.Label>)}
            <Form.Control
                className='form-control'
                style={Boolean(errors?.message) ? { borderColor: "red" } : { borderColor: "" }}
                {...attributes}
                type={type}
                placeholder="" />
        </Form.Group>
    </>)
}

export default FormInput