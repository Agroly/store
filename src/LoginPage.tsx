import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const isValidEmail = (email: string) => {
    // Регулярное выражение для проверки email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    if (!isValidEmail(emailValue)) {
      setEmailError('Пожалуйста, введите корректную почту.');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      setError('Пожалуйста, введите корректную почту.');
      return;
    }

    try {
      const response = await axios.post('https://localhost:7025/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token); // Save token to localStorage
      localStorage.setItem('user', JSON.stringify(user)); // Save user data to localStorage
      navigate('/'); // Navigate to the home page
    } catch (error) {
      setError('Неверный адрес электронной почты или пароль.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Form style={{ width: '33%' }} onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <h2>Войти</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Электронная почта</Form.Label>
          <Form.Control 
            type="email" 
            value={email} 
            onChange={handleEmailChange} 
            placeholder="Введите email" 
            required 
          />
          {emailError && <Form.Text className="text-danger">{emailError}</Form.Text>}
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Пароль</Form.Label>
          <Form.Control 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Пароль" 
            required 
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Войти
        </Button>
      </Form>
    </div>
  );
};

export default LoginPage;
