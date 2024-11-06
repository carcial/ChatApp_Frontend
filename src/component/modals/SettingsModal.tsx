import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Modal, Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../states/Store";
import { closeSettingsModal } from "../../states/SettingsModalSlice";
import { updateUser } from "../API";
import { loggedUser } from "../../states/AccountSlice";
import { CgProfile } from "react-icons/cg";
import { FormFields } from "../account/Register";


export default function SettingsModal({ logOut }: { logOut: () => void }) {
    const { showSettingsModal } = useSelector((state: RootState) => state.settings);
    const { data } = useSelector((state: RootState) => state.usersAccount);
    const dispatch: AppDispatch = useDispatch();

    const appUser = data?.[0];

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        reset,
    } = useForm<FormFields>();

    const closeThisModal = () => {
        dispatch(closeSettingsModal());

        reset({
            userName: "",
            email: "",
            password: "",
            confirmPassword: ""
        })
    };

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            if (appUser) {
                const response = await updateUser(appUser.id, formData.userName, formData.email, formData.password);
                dispatch(loggedUser(response.data));
                console.log("User updated successfully:", response.data);
                closeThisModal();
            }
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const password = watch("password");

    return (
        <Modal show={showSettingsModal} centered size="lg" onHide={closeThisModal}>
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {/* Profile Section */}

                <div className="profile-container d-block d-md-flex align-items-center justify-content-between mb-4 p-3 bg-light rounded shadow-sm">
                    <div className="d-flex align-items-center">
                        <CgProfile className="profile-icon me-3" />
                        <div className="profile-info">
                            <h5 className="mb-1">{appUser?.userName || "User Name"}</h5>
                            <p className="text-muted mb-0">{appUser?.email || "user@example.com"}</p>
                        </div>
                    </div>
                    <Button variant="outline-primary" className="logout-btn w-md-100" onClick={logOut}>
                        Logout
                    </Button>
                </div>

                {/* Form Section */}
                <h3 className="text-center">Account details</h3>
                <Form onSubmit={handleSubmit(onSubmit)} className="settings-form">
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formUserName" className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    {...register("userName")}
                                    type="text"
                                    placeholder={appUser?.userName || "Enter new username"}
                                />
                                {errors.userName && <div className="error-message">{errors.userName.message}</div>}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="formEmail" className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    {...register("email", {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address.",
                                        },
                                    })}
                                    type="email"
                                    placeholder={appUser?.email || "Enter new email"}
                                />
                                {errors.email && <div className="error-message">{errors.email.message}</div>}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formPassword" className="mb-3">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    {...register("password", {
                                        minLength: { value: 4, message: "Password must be at least 4 characters long." },
                                    })}
                                    type="password"
                                    placeholder="Enter new password"
                                />
                                {errors.password && <div className="error-message">{errors.password.message}</div>}
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group controlId="confirmPassword" className="mb-3">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control
                                    {...register("confirmPassword", {
                                        validate: (value) => !password || value === password || "Passwords do not match",
                                    })}
                                    type="password"
                                    placeholder="Confirm new password"
                                />
                                {errors.confirmPassword && (
                                    <div className="error-message">{errors.confirmPassword.message}</div>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button type="submit" className="btn-form w-100 mt-3" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
