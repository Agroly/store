import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей Bootstrap

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    password: '',
  });
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === 'password') {
      if (value.length < 5) {
        setError('Минимальная длина пароля 5 символов.');
      } else {
        setError('');
      }
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError('Неверный адрес электронной почты.');
      } else {
        setError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) return; // Don't submit if there are errors
    try {
      const response = await axios.post('https://localhost:7025/register', formData);
      console.log(response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token); // Save token to localStorage
      localStorage.setItem('user', JSON.stringify(user)); // Save user data to localStorage
      navigate('/'); // Navigate to the home page
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Form style={{ width: '33%' }} onSubmit={handleSubmit}>
        <h2>Регистрация</h2>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Адрес электронной почты</Form.Label>
          <Form.Control 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Введите email" 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>ФИО</Form.Label>
          <Form.Control 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Введите ФИО" 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicAddress">
          <Form.Label>Адрес</Form.Label>
          <Form.Control 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Введите адрес" 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Пароль</Form.Label>
          <Form.Control 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Пароль" 
            required 
          />
        </Form.Group>

        {error && <p className="text-danger">{error}</p>}

        <Button variant="primary" type="submit">
          Зарегистрироваться
        </Button>
      </Form>
    </div>
  );
};

export default RegisterPage;
