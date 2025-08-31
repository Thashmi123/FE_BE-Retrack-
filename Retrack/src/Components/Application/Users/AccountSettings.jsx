import React, { Fragment, useState, useContext } from 'react';
import { 
  Col, 
  Card, 
  CardBody, 
  CardHeader, 
  Form, 
  FormGroup, 
  Input, 
  Label, 
  Row,
  Button
} from 'reactstrap';
import { H4, H5, H6, P, Image } from '../../../AbstractElements';
import { Save, EmailAddress, FirstName, LastName, Bio, Website } from '../../../Constant';
import { useUser } from '../../../contexts/UserContext';

const AccountSettings = () => {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: user?.FirstName || '',
    lastName: user?.LastName || '',
    email: user?.Email || '',
    bio: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Update user data in context
      const updatedUserData = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email
      };
      
      updateUser(updatedUserData);
      setMessage('Account settings updated successfully!');
    } catch (error) {
      setMessage('Error updating account settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <H4 attrH4={{ className: 'card-title mb-0' }}>Account Settings</H4>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md="4">
                <div className="text-center">
                  <Image 
                    attrImage={{ 
                      className: 'img-fluid rounded-circle mb-3', 
                      src: `${require('../../../assets/images/user/7.jpg')}`, 
                      alt: 'Profile', 
                      style: { width: '150px', height: '150px' }
                    }} 
                  />
                  <div>
                    <Button color="primary" outline size="sm">
                      Change Photo
                    </Button>
                  </div>
                </div>
              </Col>
              <Col md="8">
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="firstName">{FirstName}</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="lastName">{LastName}</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="email">{EmailAddress}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="bio">{Bio}</Label>
                      <Input
                        id="bio"
                        name="bio"
                        type="textarea"
                        rows="4"
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label for="website">{Website}</Label>
                      <Input
                        id="website"
                        name="website"
                        type="text"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                
                {message && (
                  <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}
                
                <div className="form-footer">
                  <Button 
                    color="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : Save}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default AccountSettings;