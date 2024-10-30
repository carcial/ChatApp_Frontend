import { Form, Row, Col, Button } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginUser } from "../API";
import { AppDispatch } from "../../states/Store";
import { useDispatch } from "react-redux";
import { loggedUser } from "../../states/AccountSlice";
import { setUserId } from "../../states/UserFriendIdSlice ";

export type LoginFormField = {
    email: string;
    password: string;
};

export default function Login() {
    const dispatch: AppDispatch = useDispatch()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormField>();

    const onSubmit: SubmitHandler<LoginFormField> = async (data: any) => {
        try {
            const response = await loginUser(data)
            //console.log("Response from login: ", response.data)
            dispatch(loggedUser(response.data))
            dispatch(setUserId(response.data.id))

        } catch (error) {
            console.error("Login failed", error)
        }
    };

    return (
        <div className="form-container">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="loginUsernameOrEmail">
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
                            type="text"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <div className="error-message">{errors.email.message}</div>
                        )}
                    </Form.Group>
                </Row>

                <Row className="mb-3">
                    <Form.Group as={Col} controlId="loginPassword">
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

                <Button type="submit" className="btn-form">
                    {isSubmitting ? "Loading..." : "Login"}
                </Button>
            </Form>
        </div>
    );
}
