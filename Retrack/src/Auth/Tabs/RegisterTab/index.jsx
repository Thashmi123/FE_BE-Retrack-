import React, { Fragment, useState } from "react";
import { Form, FormGroup, Input, Label, Row, Col } from "reactstrap";
import { Btn, H4, P } from "../../../AbstractElements";
import {
  EmailAddress,
  Password,
  FirstName,
  LastName,
  Username,
  Gender,
  CreateAccount,
  ConfirmPassword,
  Country,
  PhoneNumber
} from "../../../Constant";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../Services/auth.service";
import { countries, countryCodes } from "../../../_helper/Countries/countries";
import "./RegisterTab.css";

const RegisterTab = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
    country: "",
    countryCode: "+94",
    phoneNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [togglePassword, setTogglePassword] = useState(false);
  const [toggleConfirmPassword, setToggleConfirmPassword] = useState(false);
  const history = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email ||
        !formData.username || !formData.password || !formData.gender) {
      setError("Please fill in all required fields");
      return;
    }
    
    // Validate age if provided
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 120)) {
      setError("Please enter a valid age (0-120)");
      return;
    }
    
    // Validate phone number if provided
    if (formData.phoneNumber && !/^\d{7,15}$/.test(formData.phoneNumber)) {
      setError("Please enter a valid phone number (7-15 digits)");
      return;
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Prepare registration data according to UserMGT requirements
      // Generate a UserId that matches the backend pattern
      const tempUserId = "USR-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      const registrationData = {
        UserId: tempUserId,
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        Username: formData.username,
        Password: formData.password,
        Gender: formData.gender,
        Age: formData.age ? parseInt(formData.age) : 0,
        Country: formData.country,
        PhoneNumber: formData.countryCode + formData.phoneNumber
      };
      
      // Register user
      await AuthService.register(registrationData);
      
      // Registration successful, redirect to login
      history("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="retrack-login-container">
        <div className="retrack-login-modal">
          <div className="retrack-login-header">
            <H4 className="retrack-title">Create Account</H4>
            <P className="retrack-subtitle">
              Fill in the information below to create your account.
            </P>
            {error && (
              <div className="alert alert-danger mt-2">
                {error}
              </div>
            )}
          </div>
          
          <Form
            className="retrack-form"
            onSubmit={handleRegisterSubmit}
            autoComplete="on"
          >
            <Row>
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{FirstName} *</Label>
                  <Input
                    className="retrack-input"
                    type="text"
                    name="firstName"
                    id="firstName"
                    required
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{LastName} *</Label>
                  <Input
                    className="retrack-input"
                    type="text"
                    name="lastName"
                    id="lastName"
                    required
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{EmailAddress} *</Label>
                  <Input
                    className="retrack-input"
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="your@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{Username} *</Label>
                  <Input
                    className="retrack-input"
                    type="text"
                    name="username"
                    id="username"
                    required
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{Password} *</Label>
                  <div className="retrack-password-container">
                    <Input
                      className="retrack-input"
                      type={togglePassword ? "text" : "password"}
                      name="password"
                      id="password"
                      required
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <div
                      className="retrack-show-hide"
                      onClick={() => setTogglePassword(!togglePassword)}
                    >
                      <span className={togglePassword ? "hide" : "show"}></span>
                    </div>
                  </div>
                  <P className="retrack-password-requirement">
                    Password must be at least 6 characters long.
                  </P>
                </FormGroup>
              </Col>
              
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{ConfirmPassword} *</Label>
                  <div className="retrack-password-container">
                    <Input
                      className="retrack-input"
                      type={toggleConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <div
                      className="retrack-show-hide"
                      onClick={() => setToggleConfirmPassword(!toggleConfirmPassword)}
                    >
                      <span className={toggleConfirmPassword ? "hide" : "show"}></span>
                    </div>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md="4">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{Gender} *</Label>
                  <Input
                    className="retrack-input"
                    type="select"
                    name="gender"
                    id="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Input>
                </FormGroup>
              </Col>
              
              <Col md="4">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">Age</Label>
                  <Input
                    className="retrack-input"
                    type="number"
                    name="age"
                    id="age"
                    min="0"
                    max="120"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              
              <Col md="4">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{Country}</Label>
                  <Input
                    className="retrack-input"
                    type="select"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            
            <Row>
              <Col md="6">
                <FormGroup className="retrack-form-group">
                  <Label className="retrack-label">{PhoneNumber}</Label>
                  <div className="retrack-phone-container">
                    <div className="retrack-phone-code">
                      <Input
                        className="retrack-input"
                        type="select"
                        name="countryCode"
                        id="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                      >
                        {countryCodes.map((code) => (
                          <option key={code.code} value={code.dial_code}>
                            {code.dial_code}
                          </option>
                        ))}
                      </Input>
                    </div>
                    <div className="retrack-phone-number">
                      <Input
                        className="retrack-input"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            
            <Btn
              attrBtn={{
                color: "primary",
                className: "retrack-login-btn",
                disabled: loading,
                type: "submit",
              }}
            >
              {loading ? "Creating Account..." : CreateAccount}
            </Btn>
          </Form>
          
          <div className="retrack-terms">
            <P className="retrack-terms-text">
              By creating an account you agree to ReTrack's{" "}
              <a href="#terms" className="retrack-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#privacy" className="retrack-link">
                Privacy Policy
              </a>
            </P>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default RegisterTab;