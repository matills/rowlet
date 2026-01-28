import { Button } from '../components/ui';
import './Landing.css';

export function Landing() {
    return (
        <div className="landing">
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="navbar__container container">
                    <div className="navbar__brand rubber-band-hover">
                        <img src="/owl-logo.png" alt="Owlist Logo" className="navbar__logo" />
                        <span className="navbar__title">OWLIST</span>
                    </div>
                    <div className="navbar__actions">
                        <Button variant="secondary" className="navbar__login">
                            INGRESAR
                        </Button>
                        <Button variant="primary" className="btn-retro">
                            REGÍSTRATE
                        </Button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero__container container">
                    <div className="hero__content">
                        <div className="hero__text">
                            <h1 className="hero__title text-stroke">
                                TRACKEA TU <br />
                                <span className="hero__title-accent">DIVERSIÓN</span>
                            </h1>
                            <p className="hero__subtitle">
                                La forma más clásica de llevar el control de tus películas, series y anime. ¡Al estilo de los viejos tiempos!
                            </p>
                            <div className="hero__actions">
                                <Button variant="primary" size="lg" className="btn-retro hero__cta">
                                    ¡Empieza Ahora!
                                </Button>
                                <Button variant="secondary" size="lg" className="hero__demo">
                                    Ver Demo
                                </Button>
                            </div>
                        </div>
                        <div className="hero__mascot">
                            <div className="hero__mascot-glow"></div>
                            <img
                                src="/owl-mascot.png"
                                alt="Owlist Mascot"
                                className="hero__mascot-img"
                            />
                        </div>
                    </div>
                </div>
                {/* Background Decorations */}
                <div className="hero__decoration hero__decoration--1"></div>
                <div className="hero__decoration hero__decoration--2"></div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features">
                <div className="features__container container">
                    <div className="features__header">
                        <h2 className="features__title">¿QUÉ HAY DE NUEVO, VIEJO?</h2>
                        <p className="features__subtitle">Todo lo que necesitas para tu entretenimiento</p>
                    </div>

                    <div className="features__grid">
                        <FeatureCard
                            icon="🎬"
                            title="Tracking Total"
                            description="Películas, Series, Anime. Todo en un solo lugar con estilo clásico."
                        />
                        <FeatureCard
                            icon="⭐"
                            title="Listas Únicas"
                            description="Crea listas compartidas con amigos. ¡La unión hace la fuerza!"
                        />
                        <FeatureCard
                            icon="🏆"
                            title="Logros"
                            description="Desbloquea medallas retro mientras completas tu catálogo."
                        />
                        <FeatureCard
                            icon="👥"
                            title="Social"
                            description="Sigue a otros búhos cinéfilos y comparte tus opiniones."
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer__container container">
                    <div className="footer__brand">
                        <img src="/owl-logo.png" alt="Logo" className="footer__logo" />
                        <span className="footer__title">OWLIST © 1930</span>
                    </div>
                    <p className="footer__tagline">
                        Hecho con mucho café y tinta vieja.
                    </p>
                </div>
            </footer>
        </div>
    );
}

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="feature-card card-retro">
            <div className="feature-card__icon">{icon}</div>
            <h3 className="feature-card__title">{title}</h3>
            <p className="feature-card__description">{description}</p>
        </div>
    );
}

export default Landing;
