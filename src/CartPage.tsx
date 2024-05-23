import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Импорт стилей Bootstrap

// Определяем интерфейс для продукта
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
}

// Определяем интерфейс для элемента корзины
interface CartItem extends Product {
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Загружаем корзину из localStorage при загрузке страницы
  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, []);

  // Функция для увеличения количества продукта в корзине
  const addToCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // Функция для уменьшения количества продукта в корзине
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

  // Функция для удаления продукта из корзины
  const deleteFromCart = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== productId);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Your Cart</h2>
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
                    <Card.Text>${item.price}</Card.Text>
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
                      Remove
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {cart.length === 0 && <p className="text-center">Your cart is empty.</p>}
      <div className="text-center mt-4">
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </Container>
  );
};

export default CartPage;
