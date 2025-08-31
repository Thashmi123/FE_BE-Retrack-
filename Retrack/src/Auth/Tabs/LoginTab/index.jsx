import React, { Fragment, useState, useContext } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";
import { Btn, H4, P } from "../../../AbstractElements";
import { Link } from "react-router-dom";
import {
  EmailAddress,
  ForgotPassword,
  LoginWithJWT,
  Password,
  RememberPassword,
  SignIn,
} from "../../../Constant";

import { useNavigate } from "react-router-dom";
import man from "../../../assets/images/dashboard/profile.png";
import AuthService from "../../../Services/auth.service";

import CustomizerContext from "../../../_helper/Customizer";
import "./LoginTab.css";

const LoginTab = ({ selected }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const history = useNavigate();
  const { layoutURL } = useContext(CustomizerContext);

  const handleGoogleLogin = () => {
    // Google OAuth implementation
    console.log("Google login clicked");
  };

  const handleMicrosoftLogin = () => {
    // Microsoft OAuth implementation
    console.log("Microsoft login clicked");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Login submitted, selected:", selected);
    console.log("Email:", email, "Password:", password);
    console.log("layoutURL from context:", layoutURL);

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use the new AuthService to login with UserMGT backend
      const response = await AuthService.login(email, password);
      console.log("Login successful, user:", response.user);

      // Get layout URL with fallback
      const currentLayout = layoutURL || "compact-wrapper";
      const redirectPath = `/pages/dashboard`;

      console.log("Redirecting to:", redirectPath);
      console.log("layoutURL value:", layoutURL);
      console.log("currentLayout:", currentLayout);

      history(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Test function for direct redirection
  // const testRedirection = () => {
  //   console.log("Testing direct redirection...");
  //   const currentLayout = layoutURL || "compact-wrapper";
  //   const redirectPath = `${process.env.PUBLIC_URL}/pages/sample-page/${currentLayout}`;
  //   console.log("Test redirect path:", redirectPath);
  //   window.location.href = redirectPath;
  // };

  return (
    <Fragment>
      <div className="retrack-login-container">
        <div className="retrack-login-modal">
          <div className="retrack-login-header">
            <H4 className="retrack-title">Welcome to ReTrack</H4>
            <P className="retrack-subtitle">
              Sign in or create an account to get started.
            </P>
            {error && (
              <div className="alert alert-danger mt-2">
                {error}
              </div>
            )}
          </div>

          <div className="retrack-social-login">
            <button
              className="retrack-social-btn google-btn"
              onClick={handleGoogleLogin}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            <button
              className="retrack-social-btn microsoft-btn"
              onClick={handleMicrosoftLogin}
            >
              <svg className="microsoft-icon" viewBox="0 0 24 24">
                <path d="M11.5 2.75h-8a.75.75 0 0 0-.75.75v8c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75z" />
                <path d="M21.5 2.75h-8a.75.75 0 0 0-.75.75v8c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75z" />
                <path d="M11.5 12.75h-8a.75.75 0 0 0-.75.75v8c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75z" />
                <path d="M21.5 12.75h-8a.75.75 0 0 0-.75.75v8c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75z" />
              </svg>
              Sign in with Microsoft
            </button>
          </div>

          <div className="retrack-separator">
            <span className="separator-line"></span>
            <span className="separator-text">OR</span>
            <span className="separator-line"></span>
          </div>

          <Form
            className="retrack-form"
            onSubmit={handleLoginSubmit}
            autoComplete="on"
          >
            <FormGroup className="retrack-form-group">
              <Label className="retrack-label">Email Address</Label>
              <Input
                className="retrack-input"
                type="email"
                name="email"
                id="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                placeholder="your@example.com"
                onChange={(e) => setEmail(e.target.value)}
                defaultValue={"test@gmail.com"}
              />
            </FormGroup>

            <FormGroup className="retrack-form-group">
              <Label className="retrack-label">Create Password</Label>
              <div className="retrack-password-container">
                <Input
                  className="retrack-input"
                  type={togglePassword ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  onChange={(e) => setPassword(e.target.value)}
                  defaultValue={"test123"}
                  required
                />
                <div
                  className="retrack-show-hide"
                  onClick={() => setTogglePassword(!togglePassword)}
                >
                  <span className={togglePassword ? "hide" : "show"}></span>
                </div>
              </div>
              <P className="retrack-password-requirement">
                Password must be at least 8 characters long.
              </P>
            </FormGroup>

            <FormGroup className="retrack-form-group">
              <div className="retrack-checkbox-container">
                <Input
                  id="remember-me"
                  type="checkbox"
                  className="retrack-checkbox"
                />
                <Label className="retrack-checkbox-label" for="remember-me">
                  Remember me
                </Label>
              </div>
            </FormGroup>

            <Btn
              attrBtn={{
                color: "primary",
                className: "retrack-login-btn",
                disabled: loading,
                type: "submit",
              }}
            >
              {loading ? "LOADING..." : "Login to ReTrack"}
            </Btn>
          </Form>

          <div className="retrack-terms">
            <P className="retrack-terms-text">
              By signing up you agree to ReTrack's{" "}
              <a href="#terms" className="retrack-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="retrack-link">
                Privacy Policy
              </a>
            </P>
          </div>
          
          <div className="retrack-register-link">
            <P className="retrack-register-text">
              Don't have an account?{" "}
              <Link to="/register" className="retrack-link">
                Register now
              </Link>
            </P>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginTab;
