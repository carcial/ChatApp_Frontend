import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import Login from "./Login";
import { registerUser } from "../API";


export type FormFields = {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterLogin() {
  const [isLogin, setIsLogin] = useState<boolean>(true);


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormFields>();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };


  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const response = await registerUser(data)
      console.log("Received data: ", response.data)
      setIsLogin(true)
    } catch (error) {
      console.error("Registration failed: ", error)
    }
  };

  const password: string = watch("password");

  return (
    <div className="form-container">
      <h2 className="form-title">{isLogin ? "Login" : "Create Account"}</h2>

      {isLogin ? (
        <Login />
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="validationCustomUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                {...register("userName", {
                  required: "Please choose a username.",
                })}
                type="text"
                placeholder="Choose a username"
              />
              {errors.userName && (
                <div className="error-message">{errors.userName.message}</div>
              )}
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="validationEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                {...register("email", {
                  required: "Please provide a valid email.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message:
                      "Please enter a valid email address (e.g., user@domain.com)",
                  },
                })}
                type="email"
                placeholder="Enter your email"
              />
              {errors.email && (
                <div className="error-message">{errors.email.message}</div>
              )}
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="validationPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                {...register("password", {
                  required: "Please provide a valid password.",
                  minLength: {
                    value: 4,
                    message: "Password must have at least 4 characters",
                  },
                })}
                type="password"
                placeholder="Enter your password"
              />
              {errors.password && (
                <div className="error-message">{errors.password.message}</div>
              )}
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="validationConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                type="password"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <div className="error-message">
                  {errors.confirmPassword.message}
                </div>
              )}
            </Form.Group>
          </Row>

          <Button type="submit" className="btn-form">
            {isSubmitting ? "Loading..." : "Register"}
          </Button>
        </Form>
      )}

      <p className="toggle-text">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span className="toggle-link" onClick={toggleForm}>
          {isLogin ? "Register" : "Login"}
        </span>
      </p>
    </div>
  );
}
