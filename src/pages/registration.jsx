import React from "react";
import {Container, Row, Col, Button, Form, Alert} from "react-bootstrap";
import { Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

import { fetchRegister, selectIsAuth } from "../redux/slices/user.js";
import {FormInput} from '../components/index.js'

import background1 from '../images/background1.png'

const Registration = () => {
  const dispatch = useDispatch();

  const isAuth = useSelector(selectIsAuth);

  // const [phone, setPhone] = React.useState("+7");

  const [errorMessage, setErrorMessage] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      patronymic: "",
      email: "",
      password: "",
      confirmPass: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    if (values.password === values.confirmPass) {
      const data = await dispatch(
        fetchRegister({
          firstName: values.firstName,
          lastName: values.lastName,
          patronymic: values.patronymic,
          email: values.email,
          role: "student",
          // phone: phone && phone,
          password: values.password
        })
      )

      setErrorMessage(data.payload.message);

      if ("token" in data.payload) {
        window.localStorage.setItem("token", data.payload.token);
      }
    } 
  };

  if (isAuth) {
    return <Navigate to="/profile" />;
  }

  return (
    <Container fluid 
    style={{
      background: `url(${background1})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }}
    >
      <Row style={{height: '100vh'}} className="d-flex row align-items-center justify-content-center">
        <Col lg={4}>
          <div className="sign-in-up-card">
            <h4 >Жүйеге тіркелу</h4>
            <hr />
            {errorMessage && errorMessage && (
              <Alert
                variant={errorMessage && errorMessage ? "danger" : "primary"}
                style={
                  errorMessage && errorMessage
                    ? { borderColor: "red" }
                    : { borderRadius: "6px" }
                }
              >
                {
                  <div className="text-center" style={{ margin: "-12px" }}>
                    {errorMessage && <span>{errorMessage}</span>}
                  </div>
                }
              </Alert>
            )}


              <Form onSubmit={handleSubmit(onSubmit)} method="post">
                <Row>
                  <Col md={12} style={{  marginBottom: '24px' }}>
                    <span >
                    Егер сізде <Link className="link" to={'/'} style={{textDecoration: 'none', fontWeight: '900'}}>SCHOOL ONLINE</Link> аккаунты болса, қазір жүйеге <Link className="link" style={{textDecoration: 'none', fontWeight: '900'}} to={'/login'}>кіре</Link> аласыз. Бұл жылдам, оңай және тегін.
                    </span> 
                  </Col>
                  <Col lg={12} xs={12}>
                    <FormInput
                    errors={ errors && errors.lastName }
                    content={'Тегіңіз'}
                    attributes={{...register("lastName", {
                      required: "Тегіңізді енгізіңіз",
                      minLength: {
                        value: 2,
                        message:
                          "Тегіңіз 2 символдан кем болмауы керек",
                      }
                    })}} />
                  </Col>

                  <Col lg={12} xs={12}>
                    <FormInput
                    errors={ errors && errors.firstName }
                    content={'Атыңыз'}
                    attributes={{...register("firstName", {
                      required: "Атыңызды енгізіңіз",
                      minLength: {
                        value: 2,
                        message:
                          "Атыңыз 2 символдан кем болмауы керек",
                      }
                    })}} />
                  </Col>
                  <Col lg={12} xs={12}>
                    <FormInput
                    errors={ errors && errors.patronymic }
                    content={'Әкеңіздің аты'}
                    attributes={{...register("patronymic", {
                      required: "Әкеңіздің атын енгізіңіз",
                      minLength: {
                        value: 2,
                        message:
                          "Әкеңіздің аты 2 символдан кем болмауы керек",
                      }
                    })}}/>
                  </Col>
                </Row>
                <Row>
                  <Col lg={12} xs={12}>
                  <FormInput 
                      errors={errors && errors.email}
                      content={'Пошта'}
                      attributes={{...register("email", {
                        required: "Поштаңызды енгізіңіз",
                        pattern: {
                          value:
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                          message: "Дұрыс форматты енгізіңіз",
                        },
                      })}}
                       />
                  </Col>

                  {/* <Col lg={6} xs={12}>
                    <Form.Group className="mb-3">
                      {!phone ? (
                        <Form.Label style={{ color: "red" }}>
                          Телефонды енгізіңіз
                        </Form.Label>
                      ) : (
                        <Form.Label>Телефон</Form.Label>
                      )}
                      <PhoneInput
                        style={
                          !phone
                            ? {
                                borderColor: "red",
                              }
                            : { borderColor: "" }
                        }
                        className="form-control phone"
                        defaultCountry="KZ"
                        value={phone}
                        onChange={setPhone}
                      />
                    </Form.Group>
                  </Col> */}

                  {/* <Col lg={6} xs={12}>
                    <FormInput 
                    errors={errors && errors.address}
                    content={'Мекенжай'}
                    attributes={{...register("address", {
                      required: "Мекенжайды енгізіңіз",
                      minLength: {
                        value: 3,
                        message: "Мекенжай атауы тым қысқа",
                      },
                    })}}
                    type={'text'}
                     />
                  </Col> */}

                  <Col lg={6} xs={12}>
                    <FormInput
                    errors={errors && errors.password}
                    content={'Құпия сөз'}
                    attributes={{...register("password", {
                      required: "Құпия сөзді енгізіңіз",
                      minLength: {
                        value: 6,
                        message:
                          "Құпия сөз 6 және 16 символ арасында болуы керек",
                      },
                      maxLength: {
                        value: 16,
                        message:
                          "Атыңыз 6 және 16 символ арасында болуы керек",
                      },
                    })}}
                    type={'password'}/>
                  </Col>

                  <Col lg={6} xs={12}>
                    <FormInput 
                    errors={errors && errors.confirmPass}
                    content={'Құпия сөзді қайталаңыз'}
                    attributes={{...register("confirmPass", {
                      required: "Құпия сөзді қайта енгізіңіз",
                      validate: (val) => {
                        if (watch("password") !== val) {
                          return "Құпия сөздер сәйкес келмейді";
                        }
                      },
                    })}}
                    type={'password'}/>

                  </Col>
                </Row>

                <Col style={{ marginTop: '16px', marginBottom: '24px' }} className="col-12 d-flex column justify-content-center align-items-center">
                  <Button
                    variant="primary"
                    style={{
                      border: 'none'
                    }}
                    type="submit">
                    Жүйеге тіркелу
                  </Button>
                </Col>
                <Col md={12} className="d-flex justify-content-center">
                    <span>Егер дайын болмасаңыз, <Link className="link" to={'/'} style={{ textDecoration: 'none', fontWeight: '900'}}>кері</Link> қайтуға болады.</span>
                </Col>
              </Form>
  
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Registration;
