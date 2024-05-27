import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Card, Row, Col, Button } from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt, FaShoppingCart, FaUser } from 'react-icons/fa'; // Импортируем иконку FaUser
import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей Bootstrap
import axios from 'axios'; // Импортируем Axios

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

const HomePage: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    // Получаем информацию о пользователе из локального хранилища при загрузке страницы
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUserName(user.name);
        }

        // Загружаем корзину из localStorage
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            setCart(JSON.parse(cartData));
        }
    }, []);

    // Получаем список продуктов с сервера с помощью Axios
    useEffect(() => {
        axios.get('https://localhost:7025/api/Products/all')
            .then(response => {
                const data = response.data;
                const productsWithFullImageUrl = data.map((product: Product) => ({
                    ...product,
                    photoUrl: 'https://localhost:7025/' + product.photoUrl
                }));
                setProducts(productsWithFullImageUrl);
                console.log(productsWithFullImageUrl)
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }, []);

    // Функция для добавления продукта в корзину
    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                // Увеличиваем количество, если продукт уже есть в корзине
                const updatedCart = prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                return updatedCart;
            } else {
                // Добавляем новый продукт в корзину
                const updatedCart = [...prevCart, { ...product, quantity: 1 }];
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                return updatedCart;
            }
        });
    };

    // Функция для уменьшения количества продукта в корзине
    const removeFromCart = (productId: number) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            ).filter(item => item.quantity > 0);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const token = localStorage.getItem('token');
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Navbar.Brand href="/">MyStore</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            {/* Иконка корзины с числом товаров */}
                            <Nav.Link as={Link} to="/cart" className="position-relative">
                                <FaShoppingCart />
                                {cartCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {cartCount}
                                    </span>
                                )}
                            </Nav.Link>
                            {token ? (
                                <>
                                    <Nav.Link as={Link} to="/account">
                                        <FaUser /> {userName}
                                    </Nav.Link>
                                    <Nav.Link onClick={handleLogout}>
                                        <FaSignOutAlt /> Выйти
                                    </Nav.Link>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login">
                                        <FaSignInAlt /> Войти
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/register">
                                        <FaSignInAlt /> Регистрация
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-5">
                <h2 className="text-center mb-4">Добро пожаловать в MyStore!</h2>

                <Row>
                    {products.map(product => {
                        const cartItem = cart.find(item => item.id === product.id);
                        return (
                            <Col key={product.id} md={4}>
                                <Card className="mb-4">
                                    <Card.Img variant="top" src={product.photoUrl} />
                                    <Card.Body>
                                        <Card.Title>{product.name}</Card.Title>
                                        <Card.Text>{product.description}</Card.Text>
                                        <Card.Text>{product.price} руб.</Card.Text>
                                        {cartItem ? (
                                            <div>
                                                <Button variant="secondary" onClick={() => removeFromCart(product.id)}>-</Button>
                                                <span className="mx-2">{cartItem.quantity}</span>
                                                <Button variant="secondary" onClick={() => addToCart(product)}>+</Button>
                                            </div>
                                        ) : (
                                            <Button variant="primary" onClick={() => addToCart(product)}>Добавить в корзину</Button>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </>
    );
};

export default HomePage;
