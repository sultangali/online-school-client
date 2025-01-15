import React from "react"
import { Container, Row, Col, Button, Form, Alert } from "react-bootstrap"
import { Link, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import "react-phone-number-input/style.css"

import { fetchLogin, selectIsAuth } from "../redux/slices/user.js"
import { FormInput } from '../components/index.js'

import background1 from '../images/background1.png'

const Login = () => {

  const dispatch = useDispatch();

  const isAuth = useSelector(selectIsAuth);

  const [errorMessage, setErrorMessage] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      login: "",
      password: ""
    },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
   
      const data = await dispatch(
        fetchLogin({
          login: values.login,
          password: values.password,
        })
      );

      setErrorMessage(data.payload.message);

      if ("token" in data.payload) {
        window.localStorage.setItem("token", data.payload.token);
      }
  };

  if (isAuth) {
    return <Navigate to="/profile" />;
  }

  return (
    <Container fluid style={{
      background: `url(${background1})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      
    }}>
      <Row style={{height: '100vh'}} className="d-flex row align-items-center justify-content-center">
        <Col lg={4} className="">
          <div className="sign-in-up-card">
            <h4>Жүйеге кіру</h4>
            <hr />
            {errorMessage && errorMessage && (
              <Alert
                variant={errorMessage && errorMessage ? "danger" : "primary"}
                style={
                  errorMessage && errorMessage
                    ? { borderColor: "red" }
                    : { borderRadius: "1px" }}>
                {
                  <div className="text-center" style={{ margin: "-12px" }}>
                    {errorMessage && <span>{errorMessage}</span>}
                  </div>
                }
              </Alert>)}
              <Form onSubmit={handleSubmit(onSubmit)} method="post">
                <Row>
                  <Col md={12} style={{  marginBottom: '24px' }}>
                  
                    <span >
                    Егер сізде <Link className="link" to={'/'} style={{textDecoration: 'none', fontWeight: '900'}}>SCHOOL ONLINE</Link> аккаунты болмаса, қазір <Link className="link" style={{textDecoration: 'none', fontWeight: '900'}} to={'/registration'}>тіркеле</Link> аласыз. Бұл жылдам, оңай және тегін.
                    </span>
                    
                  </Col>
                  <Col lg={12} xs={12}>
                    <FormInput 
                    errors={errors && errors.login} 
                    content={'Пошта немесе телефон'} 
                    attributes={{...register("login", {required: "Поштаңызды немесе телефонды енгізіңіз"})}}
                    type={'text'} />
                  </Col>
                  <Col lg={12} xs={12} >
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
                    })}}  type={'password'} />
                  
                  </Col>
                </Row>
                <Col style={{ marginTop: '16px', marginBottom: '24px' }} className="col-12 d-flex column justify-content-center align-items-center">
                  <Button
                    disabled={!isValid}
                    style={{
                      border: 'none'
                    }}
                     className="btn-signup1"
                    type="submit">
                    Жүйеге кіру
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

export default Login;
