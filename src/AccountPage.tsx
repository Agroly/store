import React, { useState, useEffect } from "react";
import { Container, Card, Button, ListGroup, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css"; // Импорт стилей Bootstrap
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios"; // Импорт AxiosResponse

// Интерфейсы для продуктов и заказов
interface Product {
  id: number;
  name: string;
  price: number;
  photoUrl: string;
  photoFileName: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  productPhotoUrl: string;
}

interface Order {
  id: number;
  orderDate: string;
  email: string;
  address: string;
  totalPrice: number;
  status: string;
  orderItems: OrderItem[];
}

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    address: string;
  } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем информацию о пользователе из localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
        const user = JSON.parse(userData);
        setUser(user);

        // Загружаем заказы пользователя
        axios
            .get(`https://localhost:7025/api/Order/byEmail?email=${user.email}`)
            .then((response: AxiosResponse<Order[]>) => {
                setOrders(response.data);
                // Получаем информацию о товарах из заказов
                const productIds = response.data.flatMap((order) =>
                    order.orderItems.map((item) => item.productId)
                );
                // Получаем информацию о товарах по их id
                axios
                    .all(
                        productIds.map((productId) =>
                            axios.get<Product>(
                                `https://localhost:7025/api/Products/${productId}`
                            )
                        )
                    )
                    .then(
                        axios.spread((...responses: AxiosResponse<Product>[]) => {
                            const productsData = responses.map((response) => {
                                console.log(response.data); 
                                return {
                                    ...response.data,
                                    photoUrl: `https://localhost:7025/images/products/${response.data.photoFileName}`
                                };
                            });
                            setProducts(productsData);
                        })
                    )
                    
                    
                    .catch((error) => {
                        console.error("Error fetching products:", error);
                    });
            })
            .catch((error) => {
                console.error("Error fetching orders:", error);
            });
    }
}, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const continueShopping = () => {
    navigate("/");
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Личный кабинет</h2>
      {user ? (
        <>
          <Card className="mx-auto mb-4" style={{ maxWidth: "500px" }}>
            <Card.Body>
              <Card.Title>Имя: {user.name}</Card.Title>
              <Card.Text>Email: {user.email}</Card.Text>
              <Card.Text>Адрес: {user.address}</Card.Text>
              <div className="d-flex justify-content-between">
                <Button variant="primary" onClick={handleLogout}>
                  Выйти
                </Button>
                <Button variant="secondary" onClick={continueShopping}>
                  Продолжить покупки
                </Button>
              </div>
            </Card.Body>
          </Card>

          <h3 className="text-center mb-4">Ваши заказы</h3>
          {orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order.id} className="mb-4">
                <Card.Body>
                  <Card.Title>Заказ #{order.id}</Card.Title>
                  <Card.Text>
                    Дата: {new Date(order.orderDate).toLocaleString()}
                  </Card.Text>
                  <Card.Text>Статус: {order.status}</Card.Text>
                  <Card.Text>Сумма: {order.totalPrice} руб.</Card.Text>
                  <Card.Text>Адрес: {order.address}</Card.Text>
                  <ListGroup variant="flush">
                    {order.orderItems.map((item) => {
                      const product = products.find(
                        (product) => product.id === item.productId
                      );
                      return (
                        <ListGroup.Item key={item.id}>
                          {product && (
                            <>
                              <Image
                                src={product.photoUrl}
                                rounded
                                className="mr-3"
                                style={{ width: "50px" }}
                              />
                              {product.name} ({product.price} руб.):{" "}
                              {item.quantity} шт.
                            </>
                          )}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-center">У вас нет заказов.</p>
          )}
        </>
      ) : (
        <p className="text-center">Пользователь не найден</p>
      )}
    </Container>
  );
};

export default AccountPage;
