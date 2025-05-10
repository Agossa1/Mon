import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaTags, FaUserShield, FaRecycle, FaTools, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { Carousel, InputGroup, FormControl, Button, Container, Row, Col } from 'react-bootstrap';

const Home = () => {
    const featuredCategories = [
        { name: "Protection Acheteur", icon: <FaUserShield />, color: "#FF5733" },
        { name: "Vendre", icon: <FaShoppingCart />, color: "#3498DB" },
        { name: "Reconditionné", icon: <FaRecycle />, color: "#F1C40F" },
        { name: "Bonnes Affaires", icon: <FaTags />, color: "#2ECC71" },
        { name: "Réparation", icon: <FaTools />, color: "#9B59B6" },
        { name: "Rachat", icon: <FaMoneyBillWave />, color: "#F39C12" },
        { name: "Estimer", icon: <FaChartLine />, color: "#E67E22" },
    ];

    const carouselItems = [
        { title: "Offre Spéciale", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
        { title: "Nouveautés", image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
        { title: "Vendre", image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" },
    ];

    const dailyDeals = [
        { id: 1, name: "Smartphone XYZ", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80", oldPrice: 599, newPrice: 499 },
        { id: 2, name: "Laptop ABC", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80", oldPrice: 1299, newPrice: 999 },
        { id: 3, name: "Écouteurs DEF", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80", oldPrice: 199, newPrice: 149 },
        { id: 4, name: "Montre GHI", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1999&q=80", oldPrice: 299, newPrice: 249 },
    ];

    return (
        <Container fluid className="px-0 mt-6">
           <section className="hero-section position-relative">
    <Carousel>
        {carouselItems.map((item, index) => (
            <Carousel.Item key={index}>
                <img
                    className="d-block w-100"
                    src={item.image}
                    alt={item.title}
                    style={{
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '10px' // Ajout du radius
                    }}
                />
                <Carousel.Caption style={{
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '10px',
                    padding: '15px'
                }}>
                    <h3>{item.title}</h3>
                    <p className="d-none d-md-block">Description pour {item.title}.</p>
                </Carousel.Caption>
            </Carousel.Item>
        ))}
    </Carousel>
    <div className="search-overlay position-absolute w-100" style={{ bottom: '20px' }}>
        <Container>
            <InputGroup className="mb-3 w-100 w-md-75 mx-auto" style={{
                borderRadius: '25px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <FormControl
                    placeholder="Que recherchez-vous ?"
                    aria-label="Search"
                    style={{ borderRadius: '25px 0 0 25px' }}
                />
                <Button variant="primary" style={{ borderRadius: '0 25px 25px 0' }}>
                    <FaSearch />
                </Button>
            </InputGroup>
        </Container>
    </div>
</section>

            <section className="featured-categories py-5">
                <Container>
                    <h2 className="text-center mb-5">Explorez Notre Marketplace</h2>
                    <Row xs={2} md={3} lg={4} className="g-4 justify-content-center">
                        {featuredCategories.map((category, index) => (
                            <Col key={index}>
                                <div className="card h-100 border-0 shadow-sm hover-elevate">
                                    <div className="card-body text-center">
                                        <div className="icon-wrapper mb-3" style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            backgroundColor: category.color,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: '1.5rem',
                                            color: 'white',
                                            margin: '0 auto'
                                        }}>
                                            {category.icon}
                                        </div>
                                        <h5 className="card-title">{category.name}</h5>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            <section className="deals-section py-5 bg-light">
                <Container>
                    <h2 className="text-center mb-5">Offres du Jour</h2>
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {dailyDeals.map((item) => (
                            <Col key={item.id}>
                                <div className="card h-100 border-0 shadow-sm hover-elevate">
                                    <img src={item.image} className="card-img-top" alt={item.name} style={{ height: '200px', objectFit: 'cover' }} />
                                    <div className="card-body">
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="card-text">
                                            <span className="text-muted text-decoration-line-through">{item.oldPrice}€</span>
                                            <span className="ms-2 text-danger fw-bold">{item.newPrice}€</span>
                                        </p>
                                        <Link to={`/product/${item.id}`} className="btn btn-outline-primary btn-sm">Voir l'offre</Link>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            <section className="cta-section py-5">
                <Container>
                    <div className="p-4 p-md-5 text-center bg-gradient text-white rounded-3">
                        <h2 className="mb-3">Rejoignez notre communauté de vendeurs</h2>
                        <p className="mb-4">Commencez à vendre dès aujourd'hui et atteignez des millions d'acheteurs</p>
                        <Link className="btn btn-light btn-lg" to="/become-seller" role="button">Devenir vendeur</Link>
                    </div>
                </Container>
            </section>
        </Container>
    );
}

export default Home;1