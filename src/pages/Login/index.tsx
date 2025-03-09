import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  Alert,
  Checkbox,
  Spin,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../components/Logo";
import "./styles.css";

const { Title, Text } = Typography;

// Create a separate controller for login logic
const useLoginController = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/";

  // Handle form submission
  const handleLogin = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    try {
      await login(values.username, values.password);

      // If remember me is checked, we could set a longer expiration for the token
      // but this would need to be handled on the backend

      // Redirect to the page user was trying to access or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      // Error is already handled in the auth context
      console.error("Login failed in component:", err);
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
  };
};

// Login component (view)
const Login: React.FC = () => {
  const { handleLogin, isLoading, error } = useLoginController();
  const [form] = Form.useForm();

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Logo />
          <Title level={3} className="login-title">
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to continue to Cinelight</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="login-alert"
          />
        )}

        <Form
          form={form}
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
          className="login-form"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div className="form-footer">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a href="#forgot-password" className="forgot-password-link">
                Forgot password?
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              size="large"
              loading={isLoading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">Don't have an account? </Text>
          <a href="#sign-up">Contact administrator</a>
        </div>
      </Card>
    </div>
  );
};

export default Login;
