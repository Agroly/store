import React, { useState, useEffect } from "react";
import { Link} from "react-router-dom";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

interface User {
  name: string;
  email: string;
  address: string;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCart(JSON.parse(cartData));
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const addToCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const deleteFromCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const handleOrder = async () => {
    if (!user) {
      setShowAlert(true);
      return;
    }

    const orderItems: OrderItem[] = cart.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
      email: user.email,
      address: user.address,
      totalPrice,
      orderItems,
      status: 'Создан'
    };

    const response = await fetch('https://localhost:7025/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (response.ok) {
      alert('Заказ успешно создан!');
      localStorage.removeItem("cart");
      setCart([]);
    } else {
      alert('Не удалось создать заказ.');
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Ваша корзина</h2>
      {showAlert && (
        <Alert variant="warning" onClose={() => setShowAlert(false)} dismissible>
          <Alert.Heading>Вы не вошли</Alert.Heading>
          <p>
            Пожалуйста, <Link to="/login">войдите</Link> или <Link to="/register">зарегистрируйтесь</Link>.
          </p>
        </Alert>
      )}
      <Row>
        {cart.map((item) => (
          <Col key={item.id} md={12} className="mb-4">
            <Card>
              <Card.Body>
                <Row>
                  <Col md={2}>
                    <Card.Img variant="top" src={item.photoUrl} />
                  </Col>
                  <Col md={4}>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Col>
                  <Col md={2}>
                    <Card.Text>{item.price} руб.</Card.Text>
                  </Col>
                  <Col md={2}>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="secondary"
                        onClick={() => removeFromCart(item.id)}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="secondary"
                        onClick={() => addToCart(item.id)}
                      >
                        +
                      </Button>
                    </div>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="danger"
                      onClick={() => deleteFromCart(item.id)}
                    >
                      Удалить
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {cart.length === 0 && <p className="text-center">Ваша корзина пуста.</p>}
      <div className="text-center mt-4">
        <Button onClick={handleOrder} className="btn btn-primary">Создать заказ</Button>
      </div>
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-primary">
          Продолжить покупки
        </Link>
      </div>
    </Container>
  );
};

export default CartPage;
